'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRegister } from '@/hooks/useAuth';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({ 
    username: '', 
    password: '', 
    confirmPassword: '' 
  });

  const registerMutation = useRegister();

  const validate = () => {
    const newErrors = { username: '', password: '', confirmPassword: '' };
    let isValid = true;

    if (!username.trim()) {
      newErrors.username = 'Username is required';
      isValid = false;
    } else if (username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
      isValid = false;
    }

    if (!password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      isValid = false;
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;

    registerMutation.mutate({ username, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="text-center text-4xl font-bold text-gray-900 mb-2">
            🗂️ LinkVault
          </h1>
          <h2 className="text-center text-2xl font-semibold text-gray-700">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Start organizing your links and notes
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {registerMutation.isError && (
            <Alert 
              type="error" 
              message={registerMutation.error instanceof Error ? registerMutation.error.message : 'Registration failed'} 
            />
          )}

          <div className="space-y-4">
            <Input
              label="Username"
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setErrors({ ...errors, username: '' });
              }}
              error={errors.username}
              placeholder="Choose a username"
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrors({ ...errors, password: '' });
              }}
              error={errors.password}
              placeholder="Create a password"
            />

            <Input
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setErrors({ ...errors, confirmPassword: '' });
              }}
              error={errors.confirmPassword}
              placeholder="Confirm your password"
            />
          </div>

          <Button
            type="submit"
            fullWidth
            isLoading={registerMutation.isPending}
          >
            Create account
          </Button>

          <p className="text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}