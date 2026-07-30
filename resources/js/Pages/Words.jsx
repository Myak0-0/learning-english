import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import '../../css/words.scss';

import WordCard from './WordCard';
import CheckCategoriesInWord from './WordParts/CheckCategoriesInWord';
import CheckWordsInCategory from './WordParts/CheckWordsInCategory';
import CreateCategory from './WordParts/CreateCategory';
import CreateWord from './WordParts/CreateWord';

import pencil from '../../images/pencil.webp';

let currentAudio = null;

const Words = ({ is_admin, initialCategories = [], currentUserId, words = null }) => {
  const [categories, setCategories] = useState(initialCategories);
  const [expandedCategories, setExpandedCategories] = useState({});
  
  const [activeModal, setActiveModal] = useState(null);
  const [selectedWord, setSelectedWord] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const [wordCard, setWordCard] = useState(null);

  useEffect(() => {
    const checkAdmin = async () => {
        if (is_admin) {
            try {
                await axios.post('/check-user-right', { user_right: is_admin });
            } catch {
                router.visit('/login');
            }
        }
    }
    checkAdmin();
  }, [is_admin]);

  useEffect(() => {
    if (activeModal == 'reload') {
      window.location.reload();
    }
  }, [activeModal])

  const shuffleArray = (array) => {
    const shuffled = [...array]; 
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const toggleCategory = (catId) => {
    setExpandedCategories(prev => ({ ...prev, [catId]: !prev[catId] }));
  };

  const speakEnglishWord = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      
      window.speechSynthesis.speak(utterance);
    }
  };

  const playAudio = (audioFile) => {
        if (!audioFile) return;
        if (currentAudio) {
            currentAudio.pause();
            currentAudio.currentTime = 0;
        }
        currentAudio = new Audio(`/word-audios/${audioFile}`);
        currentAudio.play().catch(error => console.log('Ошибка воспроизведения:', error));
  };

  const handleDeleteFromStudy = async (wordId, categoryId) => {
    try {
      await axios.post('/user/delete-word', { word_id: wordId, currentUserId });
      setCategories(prev => prev.map(cat => {
        if (cat.id !== categoryId) return cat;
        return { ...cat, words: cat.words.filter(w => w.id !== wordId) };
      }));
    } catch (error) { console.error(error); }
  };

  const handleDeleteWord = async (word_id) => {
    try {
      await axios.post('/words/delete-word', { word_id: word_id});
      
      setCategories(prev => prev.map(cat => {
        return { ...cat, words: cat.words.filter(w => w.id !== word_id) };
      }));
    } catch (error) { 
      console.error("Ошибка при создании слова:", error); 
    }    
  };

  const handleMoveCategory = async (id, isChecked) => {    
    const url = isChecked ? '/words/bind-category-word' : '/words/delete-word-from-category';    
    try {

      if (activeModal === 'manage-word' && selectedWord) {
        await axios.post(url, {
          word_id: selectedWord.id,
          category_id: id
        });

        setCategories(prev => prev.map(cat => {
          if (cat.id !== id) return cat;

          if (isChecked) {
            const exists = cat.words.some(w => w.id === selectedWord.id);
            return exists ? cat : { ...cat, words: [...cat.words, selectedWord] };
          } else {
            return { ...cat, words: cat.words.filter(w => w.id !== selectedWord.id) };
          }
        }));

      } else if (activeModal === 'manage-category' && selectedCategory) {

        await axios.post(url, {
          word_id: id,
          category_id: selectedCategory.id
        });

        const targetWord = words.find(w => w.id === id);
        
        if (!targetWord) return;

        setCategories(prev => prev.map(cat => {
            if (cat.id !== selectedCategory.id) return cat;
            
            if (isChecked) {
                const exists = cat.words?.some(w => w.id === id);
                return exists ? cat : { ...cat, words: [...(cat.words || []), targetWord] };
            } else {
                return { ...cat, words: (cat.words || []).filter(w => w.id !== id) };
            }
        }));
      }
    } catch (error) {
      console.error("Ошибка при изменении категории слова:", error);
    }
  };

  const deleteCategory = async (category_id) => {
    if (!confirm("Вы уверены что хотите удалить категорию?")) return;

    try {
      await axios.post('/words/delete-category', { category_id: category_id });
      setCategories(prev => prev.filter(cat => (cat.id !== category_id)));
    } catch (error) { console.error(error); }    
  }

  return (
    <>
      <Head title="Повторение слов" />
      <div className="words-page">
        <div className="welcome-words">
          <h3>{is_admin ? '⚙️ Панель администратора' : '👋 Рады вас видеть!'}</h3>
          <p>{is_admin ? 'Управление глобальной базой слов и рубриками' : 'Здесь отображаются изучаемые слова'}</p>
        </div>

        {is_admin && (
          <div className="admin-panel">
            <button onClick={() => setActiveModal('category')}>+ Создать категорию</button>
            <button onClick={() => setActiveModal('word')}>+ Добавить новое слово</button>
          </div>
        )}

        <div className="categories-list">
          {categories.map(category => (
            <div key={category.id} className={`item ${expandedCategories[category.id] ? 'active' : ''}`}>
              
              <div className="header" onClick={() => toggleCategory(category.id)}>

                <div className='btn-category-name'>
                  {is_admin &&
                    <button 
                      className="btn-circle delete" 
                      title="Удалить слово"
                      onClick={() => deleteCategory(category.id)}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  }
                  <span>📁 {category.name} ({category.words?.length || 0})</span>
                </div>

                <div className='learn-word'>
                  {is_admin && 
                    <button 
                      className="btn-circle edit" 
                      title="редактировать" 
                      onClick={(e) => { 
                        e.stopPropagation();
                        setActiveModal('manage-category');
                        setSelectedCategory(category);
                      }}
                    >
                      <img src={pencil} alt="pencil" />
                    </button>
                  }
                  <button onClick={() => {setWordCard(category.words || []);}}>
                    учить слова
                  </button>
                  <span className="arrow-icon">▼</span>
                </div>

              </div>

              {wordCard !== null && (
                <WordCard 
                    words={shuffleArray(wordCard)}
                    onClose={() => setWordCard(null)}
                    playAudio={playAudio}
                    speakEnglishWord={speakEnglishWord}
                />
              )}
              
              {expandedCategories[category.id] && (
                <div className="category-content">
                  {category.words && category.words.length > 0 ? (
                    <div className="words-grid">
                      {category.words.map(word => (
                        <div key={word.id} className="card">

                          <div className="info">
                            <span className="foreign">{word.name}</span>
                            <span className="separator">—</span>
                            <span className="translation">{word.translation}</span>
                          </div>

                          <div className="actions">
                            <button className="btn-circle play" title="Послушать" onClick={() => 
                              {word.audio ? playAudio(word.audio) : speakEnglishWord(word.name)}}>
                              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                            </button>
                            
                            {is_admin &&                             
                            <button 
                              className="btn-circle edit" 
                              title="редактировать" 
                              onClick={() => { 
                                setSelectedWord(word);
                                setActiveModal('manage-word');
                              }}
                            >
                              <img src={pencil} alt="pencil" />
                            </button>                            
                            }
                            
                            <button 
                              className="btn-circle delete" 
                              title={is_admin ? "Удалить слово" : "Удалить из изучаемых"} 
                              onClick={() => is_admin ? handleDeleteWord(word.id) : handleDeleteFromStudy(word.id, category.id)}
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="no-words-text">В этой категории нет слов.</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
        
        {activeModal && activeModal != 'reload' && is_admin && (
          <div className="modal-backdrop" onClick={() => activeModal == 'manage-word' || activeModal == 'manage-category' ? setActiveModal(null) : setActiveModal('reload')}>
            <div className="window" onClick={(e) => e.stopPropagation()}>
              
              {activeModal === 'category' && (
                <CreateCategory/>
              )}

              {activeModal === 'word' && (
                <CreateWord speakEnglishWord={speakEnglishWord}/>
              )}

              {activeModal === 'manage-word' && selectedWord && (
                <CheckCategoriesInWord handleMoveCategory={handleMoveCategory} selectedWord={selectedWord} categories={categories}/>
              )}

              {activeModal === 'manage-category' && (
                <CheckWordsInCategory handleMoveCategory={handleMoveCategory} 
                                      selectedCategory={selectedCategory} 
                                      words={words} categories={categories}/>
              )}

            </div>
          </div>
        )}
      </div>
    </>
  );
};

Words.layout = page => <AuthenticatedLayout header={<span>Слова</span>} children={page} />;
export default Words;
