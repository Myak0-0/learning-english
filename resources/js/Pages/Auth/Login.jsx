import InputError from '@/Components/InputError';
import { Head, useForm } from '@inertiajs/react';
import '../../../css/login.scss';

const Login = () => {
    const { data, setData, post, processing, errors, reset } = useForm({
        login: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <div className="login-page">
            <Head title="Вход в систему" />

            <div className="login-card">
                <div className="login-header">
                    <h2>Рады видеть вас!</h2>
                    <p>Введите логин и пароль для доступа к материалам</p>
                </div>

                <form onSubmit={submit}>
                    <div className="form-group">
                        <label htmlFor="login">Логин</label>
                        <input
                            id="login"
                            type="text"
                            name="login"
                            value={data.login}
                            placeholder="student77"
                            autoFocus
                            onChange={(e) => setData('login', e.target.value)}
                        />
                        <InputError message={errors.login} className="error-text" />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Пароль</label>
                        <input
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            placeholder="••••••••"
                            onChange={(e) => setData('password', e.target.value)}
                        />
                        <InputError message={errors.password} className="error-text" />
                    </div>

                    <div className="form-actions">
                        <label className="remember-me">
                            <input
                                type="checkbox"
                                name="remember"
                                checked={data.remember}
                                onChange={(e) => setData('remember', e.target.checked)}
                            />
                            <span>Запомнить меня</span>
                        </label>
                    </div>

                    <button disabled={processing}>
                        {processing ? 'Вход...' : 'Войти в аккаунт'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Login;