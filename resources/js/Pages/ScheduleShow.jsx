import React, { useEffect, useRef, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Error from "./AdditionaFiles/Error";
import '../../css/scheduleShow.scss';
import axios from 'axios';

const ScheduleShow = ({ role, students, lessons, timelineDays, teachersList, filters }) => {
    
    const [errorMessage, setErrorMessage] = useState(null);
    const [selectedLessonDetails, setSelectedLessonDetails] = useState(null);


    const hourScrollRef = useRef(null);
    const minuteScrollRef = useRef(null);

    const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
    const minutes = ['00', '15', '30', '45']; 
    const durations = [15, 30, 45, 60, 75, 90];


    const [editDetails, setEditDetails] = useState(null);
    
    const [addLesson, setAddLesson] = useState(false);

    const formatDuration = (totalMinutes) => {
        if (totalMinutes < 60) {
            return `${totalMinutes} мин`;
        }
        const hrs = Math.floor(totalMinutes / 60);
        const mins = totalMinutes % 60;
        return mins > 0 ? `${hrs} ч ${mins} мин` : `${hrs} ч`;
    };

    const timeToMinutes = (timeString) => {
        if (!timeString) return 60;
        const [hours, minutes] = timeString.split(':').map(Number);
        return (hours * 60) + minutes;
    };

    const minutesToTime = (totalMinutes) => {
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        
        const hStr = String(hours).padStart(2, '0');
        const mStr = String(minutes).padStart(2, '0');
        
        return `${hStr}:${mStr}:00`;
    };

    const handleSave = () => {
        axios.post('/schedule/update', {
            formData: editDetails
        }).then(() => router.reload()
        ).catch((err) => {
            setErrorMessage(err?.response?.data?.message || 'Ошибка сервера');
            setTimeout(() => {
                setErrorMessage(null);
            }, 4000)
        })
    };

    const deleteScheduledLesson = (scheduledLessonId) => {
        if (!confirm("Вы уверены, что хотите удалить урок?")) return;

        axios.post('/schedule/delete', { id: scheduledLessonId })
            .then(() => router.reload())
            .catch((err) => {
                setErrorMessage(err?.response?.data?.message || 'Ошибка сервера');
                setTimeout(() => {
                    setErrorMessage(null);
                }, 4000)
        });
    }

    useEffect(() => {
        if (selectedLessonDetails) {
            setEditDetails({ ...selectedLessonDetails });
        }
    }, [selectedLessonDetails]);

    const handleChange = (field, value) => {
        setEditDetails(prev => ({ ...prev, [field]: value }));
    };

    useEffect(() => {
        if (editDetails?.date_lesson) {
            const timePart = editDetails.date_lesson.split(' ')[1];
            
            if (timePart) {
                const [hour, minute] = timePart.split(':');
                
                setFormData(prev => ({
                    ...prev,
                    selectedHour: hour,
                    selectedMinute: minute
                }));

                setTimeout(() => {
                    const activeHourBtn = hourScrollRef.current?.querySelector('.active');
                    if (activeHourBtn) {
                        activeHourBtn.scrollIntoView({
                            behavior: 'smooth',
                            block: 'center'
                        });
                    }

                    const activeMinuteBtn = minuteScrollRef.current?.querySelector('.active');
                    if (activeMinuteBtn) {
                        activeMinuteBtn.scrollIntoView({
                            behavior: 'smooth',
                            block: 'center'
                        });
                    }
                }, 100);
            }
        }
    }, [editDetails]);

    const updateFilters = (newFilters) => {
        router.get(
            route('schedule'), 
            { 
                teacher_id: filters.teacher_id, 
                start_date: filters.start_date,
                end_date: filters.end_date,
                ...newFilters 
            }, 
            { preserveState: true }
        );
    };

    const handleTeacherChange = (teacherId) => updateFilters({ teacher_id: teacherId });
    const handleStartDateChange = (date) => updateFilters({ start_date: date });
    const handleEndDateChange = (date) => updateFilters({ end_date: date });



    const [formData, setFormData] = useState({
        selectedTimeZone: "+3",
        selectedDuration: "60",
        selectedScheduleStudent: null,
        selectedHour: null,
        selectedMinute: null,
        selectedPrice: 0,
        selectedDate: new Date().toISOString().split('T')[0],
        lessonLink: ''
    });

    const handleHourClick = (e, hour) => {
        if (role == 'student') return;

        setFormData(prev => ({ ...prev, selectedHour: hour }));

        const currentDatePart = editDetails?.date_lesson.split(' ')[0];
        const currentMinute = formData?.selectedMinute || '00'; 
        
        handleChange('date_lesson', `${currentDatePart} ${hour}:${currentMinute}:00`);

        e.target.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'nearest'
        });
    };

    const handleMinuteClick = (e, minute) => {
        if (role == 'student') return;

        setFormData(prev => ({ ...prev, selectedMinute: minute }));

        const currentDatePart = editDetails.date_lesson.split(' ')[0];
        const currentHour = formData.selectedHour || '00';
        
        handleChange('date_lesson', `${currentDatePart} ${currentHour}:${minute}:00`);

        e.target.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'nearest'
        });
    };

    const handleCreateSchedule = (e) => {
        e.preventDefault();
        if (!formData.selectedScheduleStudent || !formData.selectedHour || !formData.selectedMinute) return;
        const fullTime = `${formData.selectedHour}:${formData.selectedMinute}`;

        axios.post('/schedule/create', {
            student_id: formData.selectedScheduleStudent.id,
            teacher_id: filters?.teacher_id ? filters?.teacher_id : null,
            date: formData.selectedDate,
            time: fullTime,
            lesson_duration: formData.selectedDuration,
            price: formData.selectedPrice,
            lesson_link: formData.lessonLink,
            time_zone: formData.selectedTimeZone
        }).then(() => router.reload()
        ).catch((err) => {
            setErrorMessage(err?.response?.data?.message || 'Ошибка сервера');
            setTimeout(() => {
                setErrorMessage(null);
            }, 4000)
        })
    };

    return (
        <>
            <Head title='Расписание'/>
            <div className="schedule">
                <h3 className="title">📅 Запланированные занятия</h3>

                <div className="filters">
                    
                    <div className="date-selector">
                        <div>
                            <label>С:</label>
                            <input 
                                type="date" 
                                value={filters.start_date ?? ''} 
                                onChange={(e) => handleStartDateChange(e.target.value)}
                            />
                        </div>

                        <div>
                            <label>По:</label>
                            <input 
                                type="date" 
                                value={filters.end_date ?? ''} 
                                onChange={(e) => handleEndDateChange(e.target.value)}
                            />
                        </div>
                    </div>

                    {role === 'admin' && (
                        <div className="teacher-selector">
                            <label>Выбрать учителя: </label>
                            <select 
                                value={filters.teacher_id || ''} 
                                onChange={(e) => handleTeacherChange(e.target.value)}
                            >
                                <option value="">-- Выберите преподавателя --</option>
                                {teachersList?.map(teacher => (
                                    <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {(role === 'admin' || role === 'teacher') && (
                        <button onClick={() => setAddLesson(prev => !prev)}>Добавить урок</button>
                    )}
                </div>
                
                <div className="timeline-grid">
                    <div className="header">
                        <p className="column-title">Студент</p>
                        {timelineDays?.map(day => (
                            <p key={day.iso} className="column-title">
                                {day.label}
                            </p>
                        ))}
                    </div>

                    {students?.map(student => {
                        return (
                            <div key={student.id} className="row">
                                <p className="cell student">
                                    {student.name}
                                </p>

                                {timelineDays?.map(day => {
                                    const dayLessons = lessons?.filter(lesson => {
                                        if (!lesson.date_lesson) return false;
                                        const onlyDate = lesson.date_lesson.split(' ')[0];
                                        return lesson.student_id === student.id && onlyDate === day.iso;
                                    }) || [];

                                    return (
                                        <div key={day.iso} className="cell">
                                            {dayLessons.map(lesson => {
                                                const lessonTime = lesson.date_lesson.split(' ')[1]?.substring(0, 5) || '00:00';

                                                return (
                                                    <div key={lesson.id} className={`lesson-card-block ${lesson.is_paid ? 'paid' : 'unpaid'}`} onClick={() => setSelectedLessonDetails(lesson)}>
                                                        {role == 'teacher' || role == 'admin' && (
                                                            <button className='delete' onClick={(e) => { e.stopPropagation(); deleteScheduledLesson(lesson.id)}}>✕</button>
                                                        )}
                                                        <span>⏰ {lessonTime}</span>
                                                        <span>
                                                            ⏳ {lesson.lesson_duration?.substring(0, 5)}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    })}
                </div>

                {addLesson && (
                    <div className="modal-overlay" onClick={() => setAddLesson(false)}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>

                            <div className="schedule-container">
                                
                                <div className="students-picker-side">
                                    <h5>Студенты</h5>
                                    <div className="students-list">
                                        {students?.map(user => {
                                            return <div 
                                                key={user.id} 
                                                className={`student ${formData.selectedScheduleStudent?.id === user.id ? 'active' : ''}`}
                                                onClick={() => setFormData(prev => ({ ...prev, selectedScheduleStudent: user }))}
                                            >
                                                <div className="avatar">{user.name.charAt(0)}</div>
                                                <span className="name">{user.name}</span>
                                            </div>
                                        })}
                                    </div>
                                </div>

                                <div className="schedule-form-side">
                                    {formData.selectedScheduleStudent ? (
                                        <>
                                            <h4>Занятия: <span>{formData.selectedScheduleStudent.name}</span></h4>

                                            <form onSubmit={handleCreateSchedule} className='form-schedule'>
                                                
                                                <div>
                                                    <label>Дата урока</label>

                                                    <input 
                                                        type="date" 
                                                        value={formData.selectedDate}
                                                        min={role === 'teacher' ? new Date().toISOString().split('T')[0] : undefined}
                                                        onChange={(e) => setFormData(prev => ({...prev, selectedDate: e.target.value}))}
                                                    />
                                                </div>

                                                <div>
                                                    <label>Время занятия</label>
                                                    
                                                    <div className="digital-time-picker">
                                                        <div className='flex-time-column'>
                                                            <span className="column-label">Часы</span>
                                                            <span></span>
                                                            <span className="column-label">Минуты</span>
                                                        </div>

                                                        <div className='flex-time-column'>
                                                            <div className="time-column" ref={hourScrollRef}>
                                                                <div className="scroll-spacer"></div>
                                                                {hours.map(hour => (
                                                                    <button
                                                                        key={hour}
                                                                        type="button"
                                                                        className={`${formData.selectedHour === hour ? 'active' : ''}`}
                                                                        onClick={(e) => handleHourClick(e, hour)}
                                                                    >
                                                                        {hour}
                                                                    </button>
                                                                ))}
                                                                <div className="scroll-spacer"></div>
                                                            </div>

                                                            <div className="time-separator">:</div>

                                                            <div className="time-column" ref={minuteScrollRef}>
                                                                <div className="scroll-spacer"></div>
                                                                {minutes.map(minute => (
                                                                    <button
                                                                        key={minute}
                                                                        type="button"
                                                                        className={`${formData.selectedMinute === minute ? 'active' : ''}`}
                                                                        onClick={(e) => handleMinuteClick(e, minute)}
                                                                    >
                                                                        {minute}
                                                                    </button>
                                                                ))}
                                                                <div className="scroll-spacer"></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div>
                                                    <label>Длительность урока</label>
                                                    <select value={formData.selectedDuration} className="duration-picker" 
                                                            onChange={(e) => setFormData(prev => ({ ...prev, selectedDuration: e.target.value }))}>

                                                        {durations.map(mins => (
                                                        <option key={mins} value={mins}>
                                                            {formatDuration(mins)}
                                                        </option>
                                                        ))}

                                                    </select>
                                                </div>

                                                <div>
                                                    <label>Цена</label>
                                                    <input type="number" value={formData.selectedPrice} onChange={(e) => setFormData(prev => ({ ...prev, selectedPrice: e.target.value }))}/>
                                                </div>

                                                <div>
                                                    <label>Временная зона</label>
                                                    <select value={formData.selectedTimeZone} onChange={(e) => setFormData(prev => ({ ...prev, selectedTimeZone: e.target.value }))}>
                                                        <option value="+2">Калининград (UTC+2)</option>
                                                        <option value="+3">Москва, Санкт-Петербург (UTC+3)</option>
                                                        <option value="+4">Самара, Тольятти (UTC+4)</option>
                                                        <option value="+5">Екатеринбург, Челябинск, Пермь, Уфа (UTC+5)</option>
                                                        <option value="+6">Омск (UTC+6)</option>
                                                        <option value="+7">Новосибирск, Красноярск, Барнаул (UTC+7)</option>
                                                        <option value="+8">Иркутск (UTC+8)</option>
                                                        <option value="+9">Якутск (UTC+9)</option>
                                                        <option value="+10">Владивосток, Хабаровск (UTC+10)</option>
                                                        <option value="+11">Магадан, Южно-Сахалинск (UTC+11)</option>
                                                        <option value="+12">Петропавловск-Камчатский, Анадырь (UTC+12)</option>
                                                    </select>
                                                </div>

                                                <div>
                                                    <label>Ссылка на урок</label>
                                                    <input type="text" placeholder='Необязательно' onChange={(e) => setFormData(prev => ({ ...prev, lessonLink: e.target.value }))}/>
                                                </div>

                                                <button type="submit" className="schedule-submit-btn">
                                                    📅 Запланировать урок на {formData.selectedHour}:{formData.selectedMinute}
                                                </button>
                                            </form>
                                        </>
                                    ) : (
                                        <div className="empty-schedule-state">
                                            <span>🎯</span>
                                            <p>Выберите студента, чтобы настроить его расписание</p>
                                        </div>
                                    )}
                                </div>

                            </div>
                        </div>
                    </div>
                )}

                {selectedLessonDetails && editDetails && (
                    <div className="modal-overlay" onClick={() => setSelectedLessonDetails(null)}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <h3>📋 Детали занятия</h3>

                            <div className='lesson-info'>
                                <p><b>👤 Студент:</b> {students?.find(st => st.id === editDetails.student_id)?.name || 'Не указан'}</p>

                                <div>
                                    <b>📅 Дата:</b>{' '}
                                    {role === 'admin' || role === 'teacher' ? (
                                        <input 
                                            type="date" 
                                            value={editDetails?.date_lesson?.split(' ')[0] ?? ''}
                                            onChange={(e) => {
                                                const time = editDetails.date_lesson.split(' ')[1] || '00:00:00';
                                                handleChange('date_lesson', `${e.target.value} ${time}`);
                                            }}
                                            min={new Date().toISOString().split('T')[0]}
                                        />
                                    ) : (
                                        editDetails?.date_lesson.split(' ')[0]
                                    )}
                                </div>

                                <div>
                                    <b>⏰ Время занятия</b>
                                    
                                    <div className="digital-time-picker">
                                        <div className='flex-time-column'>
                                            <span className="column-label">Часы</span>
                                            <span></span>
                                            <span className="column-label">Минуты</span>
                                        </div>

                                        <div className='flex-time-column'>
                                            <div className="time-column" ref={hourScrollRef}>
                                                <div className="scroll-spacer"></div>
                                                {hours.map(hour => (
                                                    <button
                                                        key={hour}
                                                        type="button"
                                                        className={`${formData.selectedHour === hour ? 'active' : ''}`}
                                                        onClick={(e) => handleHourClick(e, hour)}
                                                    >
                                                        {hour}
                                                    </button>
                                                ))}
                                                <div className="scroll-spacer"></div>
                                            </div>

                                            <div className="time-separator">:</div>

                                            <div className="time-column" ref={minuteScrollRef}>
                                                <div className="scroll-spacer"></div>
                                                {minutes.map(minute => (
                                                    <button
                                                        key={minute}
                                                        type="button"
                                                        className={`${formData.selectedMinute === minute ? 'active' : ''}`}
                                                        onClick={(e) => handleMinuteClick(e, minute)}
                                                    >
                                                        {minute}
                                                    </button>
                                                ))}
                                                <div className="scroll-spacer"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <b>Длительность урока</b>
                                    {role === 'admin' || role === 'teacher' ? (
                                        <select value={timeToMinutes(editDetails?.lesson_duration)} 
                                                onChange={(e) => {
                                                    const mins = Number(e.target.value);
                                                    handleChange('lesson_duration', minutesToTime(mins));
                                                }}>

                                            {durations.map(mins => (
                                            <option key={mins} value={mins}>
                                                {formatDuration(mins)}
                                            </option>
                                            ))}

                                        </select>
                                    ) : (
                                        editDetails?.lesson_duration?.substring(0, 5)
                                    )}
                                </div>

                                <div>
                                    <b>🌍 Часовой пояс: </b>
                                    {role === 'admin' || role === 'teacher' ? (
                                        <select value={editDetails?.time_zone} onChange={(e) => handleChange('time_zone', e.target.value)}>
                                            <option value="+2">Калининград (UTC+2)</option>
                                            <option value="+3">Москва, Санкт-Петербург (UTC+3)</option>
                                            <option value="+4">Самара, Тольятти (UTC+4)</option>
                                            <option value="+5">Екатеринбург, Челябинск, Пермь, Уфа (UTC+5)</option>
                                            <option value="+6">Омск (UTC+6)</option>
                                            <option value="+7">Новосибирск, Красноярск, Барнаул (UTC+7)</option>
                                            <option value="+8">Иркутск (UTC+8)</option>
                                            <option value="+9">Якутск (UTC+9)</option>
                                            <option value="+10">Владивосток, Хабаровск (UTC+10)</option>
                                            <option value="+11">Магадан, Южно-Сахалинск (UTC+11)</option>
                                            <option value="+12">Петропавловск-Камчатский, Анадырь (UTC+12)</option>
                                        </select>
                                    ) : (
                                        'UTC ' + editDetails?.time_zone ?? 'неопределенно'
                                    )}
                                </div>

                                <div>
                                    <b>💲 Стоимость:</b>{' '}
                                    {role === 'admin' || role === 'teacher' ? (
                                        <input 
                                            type="number" 
                                            value={editDetails?.price ?? ''} 
                                            onChange={(e) => handleChange('price', Number(e.target.value))}
                                        />
                                    ) : (
                                        `${editDetails?.price ?? ''} руб.`
                                    )}
                                </div>

                                <div>
                                    <b>💳 Статус оплаты:</b>{' '}
                                    {role === 'admin' ? (
                                        <label>
                                            <input 
                                                type="checkbox" 
                                                checked={editDetails?.is_paid} 
                                                onChange={(e) => handleChange('is_paid', e.target.checked)}
                                            />
                                            {editDetails?.is_paid ? ' ✅ Оплачено' : ' ❌ Не оплачено'}
                                        </label>
                                    ) : (
                                        editDetails?.is_paid ? '✅ Оплачено' : '❌ Не оплачено'
                                    )}
                                </div>

                                <div>
                                    <b>🔗 Ссылка на урок:</b>{' '}
                                    {role === 'admin' || role === 'teacher' ? (
                                        <input 
                                            type="text" 
                                            placeholder="Вставьте ссылку" 
                                            value={editDetails?.lesson_link || ''} 
                                            onChange={(e) => handleChange('lesson_link', e.target.value)}
                                        />
                                    ) : (
                                        editDetails?.lesson_link ? '✅ Есть' : '❌ Нет'
                                    )}
                                </div>
                            </div>

                            {(role === 'admin' || role === 'teacher') && (
                                <div className="modal-actions">
                                    <button className="btn-save" onClick={handleSave}>💾 Сохранить</button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <Error text={errorMessage}/>
        </>
    );
};

ScheduleShow.layout = page => <AuthenticatedLayout header="Расписание" children={page} />

export default ScheduleShow;
