import { router } from '@inertiajs/react';
import axios from 'axios';
import React, { useRef, useState } from 'react';


const Schedule = ({ setErrorMessage, students, lessons }) => {
    const [selectedLessonDetails, setSelectedLessonDetails] = useState(null);

    const hourScrollRef = useRef(null);
    const minuteScrollRef = useRef(null);

    const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
    const minutes = ['00', '15', '30', '45']; 
    const durations = [15, 30, 45, 60, 75, 90]; 

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

    const formatDuration = (totalMinutes) => {
        if (totalMinutes < 60) {
            return `${totalMinutes} мин`;
        }
        const hrs = Math.floor(totalMinutes / 60);
        const mins = totalMinutes % 60;
        return mins > 0 ? `${hrs} ч ${mins} мин` : `${hrs} ч`;
    };

    const handleHourClick = (e, hour) => {
        setFormData(prev => ({ ...prev, selectedHour: hour }));
        e.target.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'nearest'
        });
    };

    const handleMinuteClick = (e, minute) => {
        setFormData(prev => ({ ...prev, selectedMinute: minute }));
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
            teacher_id: students[0].teacher_id,
            date: formData.selectedDate,
            time: fullTime,
            lesson_duration: formData.selectedDuration,
            price: formData.selectedPrice,
            lesson_link: formData.lessonLink,
            time_zone: formData.selectedTimeZone
        }).then(() => router.reload()
        ).catch((err) => {
            setErrorMessage(err?.response?.data?.message || 'Ошибка сервера');
        })
    };

    const getNextDays = () => {
        const days = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date();
            d.setDate(d.getDate() + i);

            const isoParts = d.toLocaleDateString('ru-RU', {
                timeZone: 'Europe/Moscow',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            }).split('.');

            const iso = `${isoParts[2]}-${isoParts[1]}-${isoParts[0]}`;

            days.push({
                iso: iso,
                label: d.toLocaleDateString('ru-RU', { timeZone: 'Europe/Moscow', weekday: 'short', day: 'numeric' })
            });
        }
        return days;
    };
    const timelineDays = getNextDays();

    const deleteScheduledLesson = (scheduledLessonId) => {
        if (!confirm("Вы уверены, что хотите удалить урок?")) return;

        axios.post('/schedule/delete', { id: scheduledLessonId })
            .then(() => router.reload())
            .catch((err) => {
                setErrorMessage(err?.response?.data?.message || 'Ошибка сервера');
        });
    }

    return (
        <>
        <div className="schedule-container">
            
            <div className="students-picker-side">
                <h5>Студенты</h5>
                <div className="students-list">
                    {students?.map(user => {
                        const student_info = user.user;
                        
                        return <div 
                            key={student_info.id} 
                            className={`student ${formData.selectedScheduleStudent?.id === student_info.id ? 'active' : ''}`}
                            onClick={() => setFormData(prev => ({ ...prev, selectedScheduleStudent: student_info }))}
                        >
                            <div className="avatar">{student_info.name.charAt(0)}</div>
                            <span className="name">{student_info.name}</span>
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
                                    min={new Date().toISOString().split('T')[0]}
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

        <div className="timeline-schedule">
            <h3 className="title">📅 Запланированные занятий</h3>
            
            <div className="timeline-grid">
                <div className="header">
                    <p className="cell">Студент</p>
                    {timelineDays.map(day => (
                        <p key={day.iso} className="column-title">
                            {day.label}
                        </p>
                    ))}
                </div>

                {students?.map(item => {
                    const student = item.user || item; 
                    
                    return (
                        <div key={student.id} className="row">
                            <p className="row-cell student-cell">
                                {student.name}
                            </p>

                            {timelineDays.map(day => {
                                const dayLessons = lessons?.filter(lesson => {
                                    if (!lesson.date_lesson) return false;
                                    const onlyDate = lesson.date_lesson.split(' ')[0];
                                    return lesson.student_id === student.id && onlyDate === day.iso;
                                }) || [];

                                return (
                                    <div key={day.iso} className="row-cell timeline-cell">
                                        {dayLessons.map(lesson => {
                                            const lessonTime = lesson.date_lesson.split(' ')[1]?.substring(0, 5) || '00:00';

                                            return (
                                                <div key={lesson.id} className="lesson-card-block" onClick={() => setSelectedLessonDetails(lesson)}>
                                                    <button className='delete' onClick={(e) => { e.stopPropagation(); deleteScheduledLesson(lesson.id)}}>✕</button>
                                                    <span>⏰{lessonTime}</span>
                                                    <span>
                                                        ⏳{lesson.lesson_duration?.substring(0, 5)}
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

            {selectedLessonDetails && (
                <div 
                    className="modal-overlay" 
                    onClick={() => setSelectedLessonDetails(null)}
                >
                    <div 
                        className="modal-content" 
                        onClick={(e) => e.stopPropagation() }
                    >
                        <h3>📋 Детали занятия</h3>

                        <div className='lesson-info'>
                            <p><b>👤 Студент:</b> {students.filter(it => it.student_id == selectedLessonDetails.student_id)[0]?.user?.name || ''}</p> 
                            <p><b>📅 Дата:</b> {selectedLessonDetails.date_lesson.split(' ')[0]}</p>
                            <p><b>⏰ Время начала:</b> {selectedLessonDetails.date_lesson.split(' ')[1]?.substring(0, 5)}</p>
                            <p><b>⏳ Длительность:</b> {selectedLessonDetails.lesson_duration?.substring(0, 5)}</p>
                            <p><b>🌍 Часовой пояс:</b> UTC{selectedLessonDetails.time_zone}</p>
                            <p><b>💲 Стоимость:</b> {selectedLessonDetails.price} руб.</p>
                            <p><b>💳 Статус оплаты:</b> {selectedLessonDetails.is_paid ? '✅ Оплачено' : '❌ Не оплачено'}</p>
                            <p><b>🔗 Ссылка на урок:</b> {selectedLessonDetails.lesson_link ? '✅ Есть' : '❌ Нет'}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    </>
    );
}

export default Schedule;