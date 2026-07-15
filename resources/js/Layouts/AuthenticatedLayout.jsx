import { Link, usePage } from '@inertiajs/react';
import '../../css/authenticated.scss';
import { useState } from 'react';

const AuthenticatedLayout = ({ header, children }) => {
    const { auth } = usePage().props;
    const [menuIsOpen, setMenuIsOpen] = useState(false);

    return (
        <div className="app-layout">            
            <aside className={`sidebar ${menuIsOpen && 'open'}`}>
                <div className="brand">
                    English<span>Learning</span>
                </div>
                
                <div className="user-info">
                    <p className="name">{auth.user.name}</p>
                    <span className="level">{auth.user.english_level || 'Студент'}</span>
                </div>
                
                <nav className="menu">
                    <Link href={route('lessons')} className={route().current('lessons') ? 'active' : ''}>
                        🎯 Занятия
                    </Link>
                    <Link href={route('words')} className={route().current('words') ? 'active' : ''}>
                        Повторение слов
                    </Link>
                </nav>

                <div className="footer">
                    <Link href={route('logout')} method="post" as="button" className="btn-logout">
                        🚪 Выйти
                    </Link>
                </div>
            </aside>            

            <div className="main-wrapper">
                {header && (
                    <header className="header">
                        <p className="content">
                            <span className='symbol-menu' onClick={() => setMenuIsOpen(!menuIsOpen)}>{menuIsOpen ? ('⬅') : ('☰')}</span>{header}
                        </p>
                    </header>
                )}
                
                <main className="content">
                    {children}
                </main>
            </div>
        </div>
    );
}

export default AuthenticatedLayout;