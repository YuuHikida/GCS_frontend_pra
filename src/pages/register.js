import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button, Fieldset, Input, Stack, Box } from "@chakra-ui/react";
import { Field } from "../components/ui/field";
import {
  NativeSelectField,
  NativeSelectRoot,
} from "../components/ui/native-select";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

/*概要説明等
目的：
    新規ユーザーが追加情報を入力するための登録フォームを提供
主な機能：
    ユーザー情報入力フォームの表示
    Google認証で取得した基本情報の表示
    GitHubユーザー名などの追加情報の収集
    登録情報のバックエンドへの送信
重要なポイント：
    Googleログインで取得した情報を初期値として表示
    必要な追加情報を収集
    登録完了後にダッシュボードへ遷移
*/

function Register() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        notificationEmail: user?.email || '',
        gitName: '',
        time: '21:30'
    });

    //エラー状態の管理
    const [errors, setErrors] = useState({
        googleId: '',
        notificationEmail: '',
        gitName: '',
        time: ''
    });

    //デバック
    React.useEffect(() => {
        console.log('Current user:', user);
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    googleId: user.uid,
                    notificationEmail: formData.notificationEmail,
                    gitName: formData.gitName,
                    time: formData.time
                }),
            });

            const data = await response.json();
            
            if (data.success) {
                navigate('/dashboard');
            } else {
                // エラーメッセージをポップアップで表示
                if (data.errors) {
                    Object.values(data.errors).forEach(error => {
                        toast.error(error);
                    });
                }
                setErrors(data.errors || {});
            }
        } catch (error) {
            console.error("登録エラー:", error);
            toast.error("登録中にエラーが発生しました。");
        }
    };

    const handleHourChange = (e) => {
        const newHour = e.target.value;
        const [_, minutes] = formData.time.split(':');
        setFormData({...formData, time: `${newHour}:${minutes}`});
    };

    const handleMinuteChange = (e) => {
        const newMinute = e.target.value;
        const [hours, _] = formData.time.split(':');
        setFormData({...formData, time: `${hours}:${newMinute}`});
    };

    // <ToastContainer />このコンポーネントがポップアップ表示管理
    return (
        <Box maxWidth="600px" margin="0 auto" padding="0 10%">
            <form onSubmit={handleSubmit}>
                <Fieldset.Root size="lg">
                    <Stack spacing={4}>
                        <Fieldset.Legend fontSize="2xl">ユーザー登録</Fieldset.Legend>
                        <Fieldset.HelperText fontSize="lg">
                            以下に必要な情報を入力してください。
                        </Fieldset.HelperText>
                    </Stack>

                    <Fieldset.Content>
                        <Field label="通知用メールアドレス">
                            <Input
                                type="email"
                                value={formData.notificationEmail}
                                onChange={(e) => setFormData({...formData, notificationEmail: e.target.value})}
                                placeholder="me@example.com"
                                width="140%"
                                fontSize="md"
                                borderColor="gray.300"
                            />
                        </Field>

                        <Field label="Gitユーザー名">
                            <Input
                                type="text"
                                value={formData.gitName}
                                onChange={(e) => setFormData({...formData, gitName: e.target.value})}
                                required
                                width="140%"
                                fontSize="md"
                                borderColor="gray.300"
                            />
                        </Field>

                        <Field label="通知時間">
                            <Stack direction={{ base: "column", md: "row" }} alignItems="center" spacing={2}>
                                <NativeSelectRoot>
                                    <NativeSelectField
                                        name="hour"
                                        items={Array.from({ length: 24 }, (_, hour) => String(hour).padStart(2, '0'))}
                                        value={formData.time.split(':')[0]}
                                        onChange={handleHourChange}
                                        backgroundColor="gray.100"
                                        borderColor="gray.300"
                                        width="100%"
                                    />
                                </NativeSelectRoot>
                                <span>:</span>
                                <NativeSelectRoot>
                                    <NativeSelectField
                                        name="minute"
                                        items={['00', '15', '30', '45']}
                                        value={formData.time.split(':')[1]}
                                        onChange={handleMinuteChange}
                                        backgroundColor="gray.100"
                                        borderColor="gray.300"
                                        width="100%"
                                    />
                                </NativeSelectRoot>
                            </Stack>
                        </Field>
                    </Fieldset.Content>

                    <Button type="submit" alignSelf="flex-start" fontSize="lg">
                        登録
                    </Button>
                </Fieldset.Root>
            </form>
            <ToastContainer />
        </Box>
    );
}

export default Register;