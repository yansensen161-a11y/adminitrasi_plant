import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Register" />

            <div className="mb-6 text-center">
                <h2 className="text-2xl font-bold text-white mb-2">Create an Account</h2>
                <p className="text-gray-400 text-sm">Join System Plant today</p>
            </div>

            <form onSubmit={submit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5" htmlFor="name">
                        Full Name
                    </label>
                    <input
                        id="name"
                        name="name"
                        value={data.name}
                        autoComplete="name"
                        autoFocus
                        onChange={(e) => setData('name', e.target.value)}
                        className="w-full bg-gray-900/50 border border-gray-700 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 rounded-lg shadow-sm text-white px-4 py-2.5 transition-colors"
                        placeholder="John Doe"
                        required
                    />
                    {errors.name && <p className="mt-1.5 text-sm text-red-400">{errors.name}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5" htmlFor="email">
                        Email Address
                    </label>
                    <input
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        autoComplete="username"
                        onChange={(e) => setData('email', e.target.value)}
                        className="w-full bg-gray-900/50 border border-gray-700 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 rounded-lg shadow-sm text-white px-4 py-2.5 transition-colors"
                        placeholder="you@example.com"
                        required
                    />
                    {errors.email && <p className="mt-1.5 text-sm text-red-400">{errors.email}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5" htmlFor="password">
                        Password
                    </label>
                    <input
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        autoComplete="new-password"
                        onChange={(e) => setData('password', e.target.value)}
                        className="w-full bg-gray-900/50 border border-gray-700 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 rounded-lg shadow-sm text-white px-4 py-2.5 transition-colors"
                        placeholder="••••••••"
                        required
                    />
                    {errors.password && <p className="mt-1.5 text-sm text-red-400">{errors.password}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5" htmlFor="password_confirmation">
                        Confirm Password
                    </label>
                    <input
                        id="password_confirmation"
                        type="password"
                        name="password_confirmation"
                        value={data.password_confirmation}
                        autoComplete="new-password"
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                        className="w-full bg-gray-900/50 border border-gray-700 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 rounded-lg shadow-sm text-white px-4 py-2.5 transition-colors"
                        placeholder="••••••••"
                        required
                    />
                    {errors.password_confirmation && <p className="mt-1.5 text-sm text-red-400">{errors.password_confirmation}</p>}
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-gradient-to-r from-sky-500 to-violet-600 hover:from-sky-400 hover:to-violet-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-violet-500 transition-all disabled:opacity-50"
                    >
                        Sign up
                    </button>
                </div>
                
                <p className="text-center text-sm text-gray-400 mt-6">
                    Already registered?{' '}
                    <Link href={route('login')} className="font-medium text-sky-400 hover:text-sky-300 transition-colors">
                        Sign in instead
                    </Link>
                </p>
            </form>
        </GuestLayout>
    );
}
