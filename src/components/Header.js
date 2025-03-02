import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Header.css';
import { FaHome, FaInfoCircle, FaUser, FaSignOutAlt } from 'react-icons/fa';

function Header({ children }) {
    const { user, loginWithGoogle, logout } = useAuth();
    const navigate = useNavigate();
    const [activeIndex, setActiveIndex] = useState(null);

    const handleLogin = async () => {
        try {
            const result = await loginWithGoogle();
            const idToken = await result.getIdToken();
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/auth/verify-token`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${idToken}`,
                },
            });

            const data = await response.json();
            if (data.success) {
                if (data.isNewUser) {
                    navigate('/register');
                } else {
                    navigate('/dashboard');
                }
            }
        } catch (error) {
            console.error("ログインエラー:", error);
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/');
        } catch (error) {
            console.error("ログアウトエラー:", error);
        }
    };

    const handleClick = (index) => {

        setActiveIndex(index);
        // 登録が完了していない場合をチェック
        const isRegistered = localStorage.getItem(`registered_${user?.uid}`);
        const registrationPending = localStorage.getItem('registration_pending');

        if (!isRegistered && registrationPending) {
            alert('登録を完了すると、これらの機能にアクセスできるようになります。\n登録を完了してください。');
            return;
        }

        switch(index) {
            case 0:
                navigate('/dashboard');
                break;
            case 1:
                navigate('/about');
                break;
            case 2:
                navigate('/profile');
                break;
            case 3:
                console.log("ログアウト処理呼び出し");
                handleLogout();
                return;
            default:
                break;
        }
    };

    return (
        <>
            <div className="header">
                {[
                    { icon: <FaHome />, label: 'ホーム', path: '/dashboard' },
                    { icon: <FaInfoCircle />, label: 'サイトについて', path: '/about' },
                    { icon: <FaUser />, label: '個人情報', path: '/profile' },
                    { icon: <FaSignOutAlt />, label: 'サインアウト', path: '/' }
                ].map((item, index) => (
                    <a
                        key={index}
                        href={item.path}
                        className={`nav-item ${activeIndex === index ? 'active' : ''} ${
                            !localStorage.getItem(`registered_${user?.uid}`) && 
                            localStorage.getItem('registration_pending') ? 
                            'disabled' : ''
                        }`}
                        onClick={(e) => {
                            e.preventDefault();
                            handleClick(index);
                        }}
                    >
                        {item.icon}
                        <span className="nav-label">{item.label}</span>
                    </a>
                ))}
            </div>
            <div style={{ marginTop: '70px' }}>
                {children}
            </div>
        </>
    );
}

export default Header; 