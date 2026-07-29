import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import '../../css/words.scss';

import WordCard from './WordCard';

import pencil from '../../images/pencil.webp';

let currentAudio = null;

const Words = ({ is_admin, initialCategories = [], currentUserId }) => {
  const [categories, setCategories] = useState(initialCategories);
  const [expandedCategories, setExpandedCategories] = useState({});
  
  const [activeModal, setActiveModal] = useState(null);
  const [selectedWord, setSelectedWord] = useState(null);

  const [newCategoryName, setNewCategoryName] = useState('');
  const [newWord, setNewWord] = useState({ name: '', translation: '', audio: null });  

  const [wordCard, setWordCard] = useState(null);

  useEffect(() => {
    if (activeModal == 'reload') {
      window.location.reload();
    }
  }, [activeModal])

  const toggleCategory = (catId) => {
    setExpandedCategories(prev => ({ ...prev, [catId]: !prev[catId] }));
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

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/words/add-category', { name: newCategoryName });
      setNewCategoryName('');
    } catch (error) { console.error(error); }
  };

  const handleCreateWord = async (e) => {
    e.preventDefault();
  
    const formData = new FormData();
    formData.append('name', newWord.name);
    formData.append('translation', newWord.translation);
    if (newWord.audio) {
      formData.append('audio', newWord.audio);
    }

    try {
      await axios.post('/words/add-word', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setNewWord({ name: '', translation: '', audio: null });      
    } catch (error) { 
      console.error("Ошибка при создании слова:", error); 
    }    
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

  const handleRemoveFromCategory = async (categoryId, isChecked) => {
    const url = isChecked ? '/words/bind-category-word' : '/words/delete-word-from-category';
    try {
      await axios.post(url, {
        word_id: selectedWord.id,
        category_id: categoryId
      });

      setCategories(prev => prev.map(cat => {
        if (cat.id !== categoryId) return cat;
        if (isChecked) {
          const exists = cat.words.some(w => w.id === selectedWord.id);
          return exists ? cat : { ...cat, words: [...cat.words, selectedWord] };
        } else {
          return { ...cat, words: cat.words.filter(w => w.id !== selectedWord.id) };
        }      
      }));
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
                  <button onClick={() => {setWordCard(category.words || []);}}>
                    учить слова
                  </button>
                  <span className="arrow-icon">▼</span>
                </div>

              </div>

              {wordCard !== null && (
                <WordCard 
                    words={wordCard} 
                    onClose={() => setWordCard(null)}
                    playAudio={playAudio}
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
                            <button className="btn-circle play" title="Послушать" onClick={() => playAudio(word.audio)}>
                              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                            </button>
                            
                            {is_admin && 
                            <>
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
                            </>
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
        
        {activeModal && activeModal != 'reload' && (
          <div className="modal-backdrop" onClick={() => activeModal == 'manage-word' ? setActiveModal(null) : setActiveModal('reload')}>
            <div className="window" onClick={(e) => e.stopPropagation()}>
              
              {activeModal === 'category' && (
                <form onSubmit={handleCreateCategory}>
                  <h4>Создать новую категорию</h4>
                  <input type="text" placeholder="Название категории" value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} required />
                  <button type="submit">Сохранить</button>
                </form>
              )}

              {activeModal === 'word' && (
                <form onSubmit={handleCreateWord}>
                  <h4>Добавить новое слово в базу</h4>
                  <input type="text" placeholder="Слово" value={newWord.name} onChange={e => setNewWord({...newWord, name: e.target.value})} required />
                  <input type="text" placeholder="Перевод" value={newWord.translation} onChange={e => setNewWord({...newWord, translation: e.target.value})} required />
                  <input type="file" className='file' accept="audio/mp3, audio/mpeg" onChange={e => setNewWord({...newWord, audio: e.target.files[0]})} />
                  <button type="submit">Создать слово</button>
                </form>
              )}

              {activeModal === 'manage-word' && selectedWord && (
                <div className="manage-word-categories">
                  <h4>Категории для слова: <span className="highlight-word">"{selectedWord.name}"</span></h4>
                  <p className="subtitle">Отметьте папки, в которых должно находиться слово</p>
                  
                  <div className="list">
                    {categories
                      .filter(c => c.id !== 0)
                      .map(cat => {
                        const isAttached = cat.words?.some(w => w.id === selectedWord.id);

                        return (
                          <label key={cat.id} className="item">
                            <input 
                              type="checkbox" 
                              checked={isAttached} 
                              onChange={(e) => handleRemoveFromCategory(cat.id, e.target.checked)}
                            />
                            <span>📁 {cat.name}</span>
                          </label>
                        );
                    })}
                  </div>
                </div>
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
