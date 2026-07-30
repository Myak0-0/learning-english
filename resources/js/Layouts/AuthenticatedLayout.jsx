import { Link, router, usePage } from '@inertiajs/react';
import '../../css/authenticated.scss';
import { useEffect, useRef, useState } from 'react';
import axios from 'axios';

import search_icon from '../../images/search.webp';

let currentAudio = null;

const AuthenticatedLayout = ({ header, children }) => {
    const { auth } = usePage().props;
    const [menuIsOpen, setMenuIsOpen] = useState(false);

    const [searchQuery, setSearchQuery] = useState('');
    const [mobileSearch, setMobileSearch] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [isFocused, setIsFocused] = useState(false);
    const searchContainerRef = useRef(null);

    const playAudio = (audioFile) => {
        if (!audioFile) return;
        if (currentAudio) {
            currentAudio.pause();
            currentAudio.currentTime = 0;
        }
        currentAudio = new Audio(`/word-audios/${audioFile}`);
        currentAudio.play().catch(error => console.log('Ошибка воспроизведения:', error));
    };
    
    const addWords = async (wordIds) => {
        if (!wordIds || wordIds.length === 0) return;
        
        try {
            await axios.post('/user/add-word', { word_ids: wordIds, currentUserId: auth.user.id });
        } catch (error) {
            console.error("Ошибка при добавлении слов:", error);
            return;
        }

        setSearchResults(prevWords => 
            prevWords.map(word => 
                wordIds.includes(word.id) ? { ...word, time_of_repeatings: [{word}] } : word
            )
        );
    };

    const deleteWord = async (wordId) => {
        if (!wordId) return;
        
        try {
            await axios.post('/user/delete-word', { word_id: wordId, currentUserId: auth.user.id });
        } catch (error) {
            console.error("Ошибка при удалении слова:", error);
            return;
        }

        setSearchResults(prevWords => 
            prevWords.map(word => 
                word.id === wordId ? { ...word, time_of_repeatings: [] } : word
            )
        );
    };

    useEffect(() => {
        const checkAdmin = async () => {
            if (auth.user?.is_admin) {
                try {
                    await axios.post('/check-user-right', { user_right: auth.user?.is_admin });
                } catch {
                    router.visit('/login');
                }
            }
        }
        checkAdmin();
    }, [auth.user?.is_admin])

    useEffect(() => {
        if (!searchQuery.trim()) {
            setSearchResults([]);
            return;
        }

        const delayDebounceFn = setTimeout(() => {
            axios.post('/words/search', { query: searchQuery })
                .then(res => {
                    setSearchResults(res.data.words);
                })
                .catch(err => console.error(err));
        }, 1000);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
                setIsFocused(false);
                setMobileSearch(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="app-layout">
            <aside className={`sidebar ${menuIsOpen && 'open'}`}>
                <div className="brand">
                    English<span>Learning</span>
                    {menuIsOpen && (<span className='mobile-arrow' onClick={() => setMenuIsOpen(!menuIsOpen)}>⬅</span>)}
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
                    {auth.user?.is_admin && auth.user?.is_admin &&
                        <Link href={route('choose-user')} className={route().current('choose-user') ? 'active' : ''}>
                            Выбрать пользователя
                        </Link>
                    }
                </nav>

                <div className="footer">
                    <Link href={route('logout')} method="post" as="button" className="btn-logout">
                        🚪 Выйти
                    </Link>
                </div>
            </aside>            

            <div className="main-wrapper">
                {header && (
                    <header>
                        <div className="content">
                            <span className='symbol-menu' onClick={() => setMenuIsOpen(!menuIsOpen)}>{menuIsOpen ? ('⬅') : ('☰')}</span>
                            <span>{header}</span>
                        </div>
                        
                        <div ref={searchContainerRef}>
                            <img src={search_icon} alt="search" className='search-icon'
                                onClick={() => setMobileSearch(!mobileSearch)}/>

                            <div className={`${mobileSearch ? 'active' : ''} search`}>
                                <input type="text" placeholder='Поиск слов' 
                                    onChange={(e) => setSearchQuery(e.target.value)} 
                                    onFocus={() => setIsFocused(true)}/>
                                    
                                {isFocused && (
                                    searchResults.length > 0 ? (
                                        <div className='list'>
                                            {searchResults.map((word) => (
                                                <div key={word.id} className='search-word'>                                            
                                                    <p className='word-name'>{word.name}</p>
                                                    
                                                    <div className='actions'>
                                                        <button className="btn-circle play" onClick={() => playAudio(word.audio)} title="Послушать">
                                                            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                                                        </button>

                                                        {word.time_of_repeatings && word.time_of_repeatings.length > 0 ? (
                                                            <button className="btn-circle delete" title="Удалить из слов" onClick={() => deleteWord(word.id)}>
                                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">     
                                                                    <line x1="18" y1="6" x2="6" y2="18"></line> 
                                                                    <line x1="6" y1="6" x2="18" y2="18"></line> 
                                                                </svg> 
                                                            </button>                            
                                                        ) : (
                                                            <button className="btn-circle add" title="Добавить в свои слова" onClick={() => addWords([word.id])}>
                                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                                    <line x1="12" y1="5" x2="12" y2="19"></line>
                                                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                                                </svg>
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className='list empty'>
                                            <p>----------</p>
                                        </div>
                                    )
                                )}
                            </div>
                        </div>
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