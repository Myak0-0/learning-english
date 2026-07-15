import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import '../../css/dashboard.scss';

const Lessons = () => {
    return (
        <>
            <Head title="Занятия" />

            <div className="dashboard-container">
                <div className="welcome-card">
                    <h3 className="welcome-title">👋 Рады вас видеть!</h3>
                    <p className="welcome-text">
                        Здесь будут отображаться папки с уроками и темами, 
                        к которым ваш преподаватель открыл доступ.
                    </p>
                </div>
            </div>
        </>
    );
}

Lessons.layout = page => <AuthenticatedLayout header="Занятия" children={page} />

export default Lessons;