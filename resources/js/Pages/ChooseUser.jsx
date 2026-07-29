import { useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router } from "@inertiajs/react";
import axios from "axios";
import '../../css/chooseUser.scss';

const ChooseUser = ({ users, sections, active_Id }) => {
    const [selectedUser, setSelectedUser] = useState(null);    
    const [activeStudentId, setActiveStudentId] = useState(active_Id);
    const [allowedSections, setAllowedSections] = useState([]);
    const [activeModal, setActiveModal] = useState(false);

    const [formData, setFormData] = useState({
        login: '',
        name: '',
        password: '',
        english_level: null
    })

    const handleSelectUser = (user) => {
        setSelectedUser(user);
        
        const rights = user.rights ? user.rights.map(r => r.section_id) : [];        
        setAllowedSections(rights);
    };

    const handleToggleActiveSession = (userId) => {
        setActiveStudentId(userId);
        
        axios.post('/set-active-student', { user_id: userId })
    };

    const handleToggleRight = (sectionId) => {
        if (!selectedUser) return;

        const isChecked = allowedSections.includes(sectionId);
        let updatedRights = [];

        if (isChecked) {
            updatedRights = allowedSections.filter(id => id !== sectionId);
        } else {            
            updatedRights = [...allowedSections, sectionId];
        }

        setAllowedSections(updatedRights);

        axios.post('/save-user-right', {
            user_id: selectedUser.id,
            section_id: sectionId,
            action: isChecked ? 'revoke' : 'grant'
        }).then(() => {
            selectedUser.rights = updatedRights.map(id => ({ section_id: id, user_id: selectedUser.id }));
        })
    };

    const handleCreateUser = (e) => {
        e.preventDefault();

        try {
            axios.post('/user/create', {
                login: formData.login,
                name: formData.name,
                password: formData.password,
                english_level: formData.english_level
            })
            .then(() => {
                setActiveModal(false);
                router.reload();
            });
        } catch (err) {

        }
    }

    return (
        <div className="teacher-panel-container">
            <Head title="Панель преподавателя" />
            
            <div className="users-list-side">
                <h3 className="title">👥 Ваши ученики</h3>
                <div className="list-wrapper">
                    {users.map(user => (
                        <div 
                            key={user.id} 
                            className={`user-row ${selectedUser?.id === user.id ? 'selected' : ''}`}
                            onClick={() => handleSelectUser(user)}
                        >
                            <span className="name">{user.name}</span>
                            {activeStudentId === user.id && (
                                <span className="active-user">🎯 На занятии</span>
                            )}
                        </div>
                    ))}
                </div>
                <button onClick={() => setActiveModal(true)}>Добавить пользователя</button>
            </div>
            
            {selectedUser ? (
                <div className="management-card">
                    <div className="card-header">
                        <h4>⚙️ Управление: {selectedUser.name}</h4>
                    </div>

                    <div className="box-block">
                        <label>
                            <input 
                                type="checkbox"
                                checked={activeStudentId === selectedUser.id}
                                onChange={() => handleToggleActiveSession(selectedUser.id)}
                            />
                            <span>Текущий студент на занятии</span>
                        </label>
                        <p className="text">
                            Если включено, ответы этого ученика будут выводиться на страницах уроков.
                        </p>
                    </div>

                                            
                    <div className="rights-list">
                        <h5>📂 Доступы к материалам:</h5>
                        {(() => {
                            const renderSectionTree = (parentId = null, depth = 0) => {
                                const currentLevelElements = sections.filter(s => {
                                    if (parentId === null) {
                                        return !s.parent_id;
                                    }
                                    return s.parent_id === parentId;
                                });

                                if (currentLevelElements.length === 0) return null;

                                return currentLevelElements.map(section => {
                                    const isTopic = section.is_topic === 1 || section.is_topic === true;                                                                                                
                                    const hasChildren = sections.some(s => s.parent_id === section.id);

                                    return (
                                        <div key={section.id} className="section-inside">                                                        
                                            <label 
                                                className={`${isTopic ? 'is-topic' : 'is-folder'}`}                                                            
                                                style={{ marginLeft: `${depth * 24}px` }} 
                                            >
                                                <input 
                                                    type="checkbox"
                                                    checked={allowedSections.includes(section.id)}
                                                    onChange={() => handleToggleRight(section.id)}
                                                />
                                                <span>
                                                    {isTopic ? '📄 ' : '📁 '} {section.title}
                                                </span>
                                            </label>

                                            {hasChildren && renderSectionTree(section.id, depth + 1)}
                                        </div>
                                    );
                                });
                            };                                        
                            return renderSectionTree(null, 0);
                        })()}
                    </div>
                </div>
            ) : (
                <div className="empty-card">
                    <p>👈 Выберите ученика из списка, чтобы настроить доступы и активировать урок</p>
                </div>
            )}

            {activeModal && (
                <div className="modal-backdrop" onClick={() => setActiveModal(false)}>
                    <div className="window" onClick={(e) => e.stopPropagation()}>                    
                        <form onSubmit={handleCreateUser}>
                            <h4>Создание пользователя</h4>

                            <input placeholder="Введите логин" type="text" value={formData.login} onChange={(e) => setFormData(prev => ({...prev, login: e.target.value}))}/>                      
                            <input placeholder="Введите имя" type="text" value={formData.name} onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}/>                          
                            <input placeholder="Введите пароль" type="password" value={formData.password} onChange={(e) => setFormData(prev => ({...prev, password: e.target.value}))}/>                             
                            <input placeholder="Введите уровень английского" type="text" value={formData.english_level} onChange={(e) => setFormData(prev => ({...prev, english_level: e.target.value}))}/>

                            <button>Создать пользователя</button>
                        </form>                        
                    </div>
                </div>
            )}
        </div>
    );
};

ChooseUser.layout = page => <AuthenticatedLayout header="Панель преподавателя" children={page} />;
export default ChooseUser;
