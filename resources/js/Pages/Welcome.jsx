import { Head, router } from '@inertiajs/react';
import '../../css/welcome.scss';
import illustrationImg from '../../images/illustration.webp'; 

const Welcome = ({ auth }) => {
    const handleSubmit = () => {
        if (auth.user) {
            router.visit(route('lessons'));
        } else {
            router.visit(route('login'));
        }
    }

    return (
        <div className="welcome-container">
            <Head title="Изучение английского языка" />
            
            <header className="welcome-header">
                <div className="logo">English<span>Learning</span></div>
                <nav>
                    {auth.user ? (
                        <span className='link' onClick={handleSubmit}>Личный кабинет</span>
                    ) : (
                        <span className='link' onClick={handleSubmit}>Войти</span>
                    )}
                </nav>
            </header>

            <main className="welcome-main">
                <div className="text">
                    <h1>Платформа для эффективного изучения английского</h1>
                    <p>Доступ к урокам, интерактивным заданиям и персональному словарю по приглашению вашего преподавателя.</p>
                    <div>
                        <span className='link' onClick={handleSubmit}>Начать обучение</span>
                    </div>
                </div>
                <div className="image">
                    <img src={illustrationImg} alt="Studying Illustration" />                    
                </div>
            </main>
        </div>
    );
}

export default Welcome;
