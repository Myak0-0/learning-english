import { useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router } from "@inertiajs/react";
import axios from "axios";
import '../../css/chooseUser.scss';
import pencil from '../../images/pencil.webp';
import Error from "./AdditionaFiles/Error";
import Schedule from "./Schedule"

const ChooseUser = ({ users, sections, active_Id }) => {
    const [selectedUser, setSelectedUser] = useState(null);    
    const [activeStudentId, setActiveStudentId] = useState(active_Id);
    const [allowedSections, setAllowedSections] = useState([]);
    const [activeModal, setActiveModal] = useState(false);
    const [expandedFolders, setExpandedFolders] = useState([]);
    const [formShow, setFormShow] = useState('personal-data');

    const [errorMessage, setErrorMessage] = useState(null);

    const [formData, setFormData] = useState({
        id: '',
        login: '',
        name: '',
        password: '',
        english_level: null,
        user_info: '',
        type_of_right: 'student'
    })

    const teachersList = users?.teacher || [];
    const teacher = teachersList.find(it => it.id == formData.id);

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

        axios.post('/user/create', formData)
        .then(() => {
            setActiveModal(false);
            router.reload();
        })
        .catch((err) => {
            setErrorMessage(err?.response?.data?.message || 'Ошибка сервера');
        });
    }

    const deleteUser = (user_id) => {
        if (!confirm("Вы уверены, что хотите удалить пользователя?")) return;

        axios.post('/user/delete', { id: user_id })
            .then(() => router.reload())
            .catch((error) => {
                console.error('Ошибка удаления:', error);
        });
    }

    const toggleFolder = (folderId) => {
        setExpandedFolders(prev =>
        prev.includes(folderId)
            ? prev.filter(id => id !== folderId)
            : [...prev, folderId]
        );
    };

    const toggleTeacherStudent = (student_id) => {
        axios.post('/user/teacher-student', {
            student_id: student_id,
            teacher_id: formData.id
        }).then(() => router.reload())
        .catch((err) => {
            setErrorMessage(err?.response?.data?.message || 'Ошибка сервера');
        });
    }

    return (
        <div className="teacher-panel-container">
            <Head title="Панель преподавателя" />
            
            <div className="users-list-side">
                {Object.entries(users).map(([role, group_user]) => (
                    <div className="list-wrapper" key={role}>
                        <h3 className="title">👥 Ваши {role}</h3>

                        {group_user.map(user => (
                            <div 
                                key={user.id} 
                                className={`user-row ${selectedUser?.id === user.id ? 'selected' : ''}`}
                                onClick={() => handleSelectUser(user)}
                            >
                                <span className="name">{user.name}</span>
                                {activeStudentId === user.id && (
                                    <span className="active-user">🎯 На занятии</span>
                                )}

                                <div className="action-buttons">
                                    <button className="edit" onClick={() => {
                                        setActiveModal('update')
                                        setFormData({
                                            id: user.id,
                                            login: user.login,
                                            name: user.name,
                                            password: '',
                                            english_level: user.english_level,
                                            user_info: user.user_info,
                                            type_of_right: user.role?.type_of_right ? user.role.type_of_right : 'student'
                                        })
                                    }}>
                                        <img src={pencil} alt="pencil"/>
                                    </button>
                                    <button className='delete' onClick={() => deleteUser(user.id)}>✕</button>
                                </div>
                            </div>
                        ))}
                    </div>
                ))}

                <button onClick={() => {
                    setActiveModal('new')
                    setFormData({
                        id: '',
                        login: '',
                        name: '',
                        password: '',
                        english_level: '',
                        user_info: '',
                        type_of_right: 'student'
                    })
                }}>
                    Добавить пользователя
                </button>
            </div>
            
            {selectedUser && selectedUser?.role?.type_of_right == null ? (
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
                                    const isExpanded = expandedFolders.includes(section.id);

                                    return (
                                        <div key={section.id} className='section-inside' style={{ marginLeft: `${depth * 1}rem` }}>

                                            <label className={`${isTopic ? 'is-topic' : 'is-folder'}`}>
                                                {!isTopic && hasChildren && (
                                                    <span
                                                        onClick={(e) => {e.preventDefault(); toggleFolder(section.id)}}
                                                        style={{transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)'}}
                                                        className="arrow-folder"
                                                    >
                                                        ▶
                                                    </span>
                                                )}
                                                <input 
                                                    type="checkbox"
                                                    checked={allowedSections.includes(section.id)}
                                                    onChange={() => handleToggleRight(section.id)}
                                                />
                                                <span>
                                                    {isTopic ? '📄 ' : '📁 '} {section.title}
                                                </span>
                                            </label>

                                            {hasChildren && isExpanded && renderSectionTree(section.id, depth + 1)}
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
                <div className="modal-backdrop" onClick={() => {setActiveModal(false); setFormShow('personal-data')}}>

                    {formData.type_of_right == 'teacher' && (
                        <div className="switch-block" onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const targetSpan = e.target.closest('span[data-value]');
                            if (targetSpan) {
                                setFormShow(targetSpan.dataset.value);
                            }
                        }}>
                            <span data-value='personal-data' className={`${formShow == 'personal-data' ? 'active' : ''}`}>Данные</span>
                            <span data-value='teacher-student' className={`${formShow == 'teacher-student' ? 'active' : ''}`}>Студенты</span>
                            <span data-value='student-schedule' className={`${formShow == 'student-schedule' ? 'active' : ''}`}>Расписание</span>
                        </div>
                    )}

                    <div className="window" onClick={(e) => e.stopPropagation()}>

                        {formShow == 'personal-data' ? (
                            <form onSubmit={handleCreateUser}>
                                <h4>{activeModal == 'new' ? 'Создание пользователя' : activeModal == 'update' ? 'Обновление данных' : ''}</h4>

                                <input placeholder="Введите логин" type="text" value={formData.login} onChange={(e) => setFormData(prev => ({...prev, login: e.target.value}))}/>                      
                                <input placeholder="Введите имя" type="text" value={formData.name} onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}/>                          
                                <input placeholder={activeModal == 'new' ? 'Введите пароль' : activeModal == 'update' ? 'Новый пароль' : ''} type="password" value={formData.password} onChange={(e) => setFormData(prev => ({...prev, password: e.target.value}))}/>                             
                                <input placeholder="Введите уровень английского" type="text" value={formData?.english_level || ''} onChange={(e) => setFormData(prev => ({...prev, english_level: e.target.value}))}/>
                                <textarea placeholder="Дополонительная информация" onChange={(e) => setFormData(prev => ({...prev, user_info: e.target.value}))} value={formData?.user_info || ''}></textarea>

                                <select value={formData.type_of_right} onChange={(e) => setFormData(prev => ({...prev, type_of_right: e.target.value}))}>
                                    <option value="admin">Администратор</option>
                                    <option value="teacher">Учитель</option>
                                    <option value="student">Ученик</option>
                                </select>

                                <button>{activeModal == 'new' ? 'Создать пользователя' : activeModal == 'update' ? 'Обновить данные' : ''}</button>
                            </form>
                        ) : formShow == 'teacher-student' && formData.type_of_right == 'teacher' ? (
                            
                            <form>
                                <h4>Студенты учителя</h4>

                                {(() => {
                                    const currentStudentIds = teacher?.teacher_students?.map(s => s.user?.id) || [];
                                    const availableStudents = users?.student?.filter(student => !currentStudentIds.includes(student.id)) || [];

                                    return (
                                        <>
                                            <ul className="students-list">
                                                {!teacher?.teacher_students?.length ? (
                                                    <p className="empty-message">У этого учителя пока нет студентов</p>
                                                ) : (
                                                    teacher.teacher_students.map((student) => {
                                                        const student_info = student.user;
                                                        if (!student_info) return null;

                                                        return (
                                                            <li key={student_info.id}>
                                                                <span className="student-name">{student_info.name}</span>
                                                                <button 
                                                                    type="button" 
                                                                    className="delete-btn" 
                                                                    onClick={() => toggleTeacherStudent(student_info.id)}
                                                                    title="Удалить студента"
                                                                >
                                                                    &times;
                                                                </button>
                                                            </li>
                                                        );
                                                    })
                                                )}
                                            </ul>

                                            <div className="add-student-form">
                                                <h5>Добавить студента</h5>

                                                <select 
                                                    onChange={(e) => {
                                                        if (e.target.value) {
                                                            toggleTeacherStudent(Number(e.target.value));
                                                        }
                                                    }}
                                                >
                                                    <option value="">Выберите студента...</option>
                                                    
                                                    {availableStudents.map((student) => (
                                                        <option key={student.id} value={student.id}>
                                                            {student.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </>
                                    );
                                })()}
                            </form>

                        ) : formShow == 'student-schedule' && (
                            <Schedule setErrorMessage={setErrorMessage} students={teacher.teacher_students} lessons={teacher.time_of_lessons}/>
                        )}
                    </div>
                </div>
            )}

            <Error text={errorMessage}/>
        </div>
    );
};

ChooseUser.layout = page => <AuthenticatedLayout header="Панель преподавателя" children={page} />;
export default ChooseUser;
