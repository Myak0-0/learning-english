import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import '../../css/dashboard.scss';

const Words = () => {
    return (
        <>
            <Head title="Повторение слов" />

            <div className="dashboard-container">
                <div className="welcome-card">
                    <h3 className="welcome-title">👋 Рады вас видеть!</h3>
                    <p className="welcome-text">
                        Здесь будут отображаться папки слова
                    </p>
                </div>
            </div>
        </>
    );
}

Words.layout = page => <AuthenticatedLayout header={<span>Слова</span>} children={page} />

export default Words;