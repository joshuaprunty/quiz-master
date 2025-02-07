'use client'
import signIn from "@/firebase/auth/signIn";
import { useRouter } from 'next/navigation';
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

function Page() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleForm = async (event) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    const { result, error } = await signIn(email, password);

    if (error) {
      setIsLoading(false);
      // Handle different Firebase auth error codes
      switch (error.code) {
        case 'auth/invalid-email':
          setError('Invalid email address format.');
          break;
        case 'auth/user-not-found':
          setError('No account found with this email.');
          break;
        case 'auth/wrong-password':
          setError('Incorrect password.');
          break;
        case 'auth/too-many-requests':
          setError('Too many failed attempts. Please try again later.');
          break;
        default:
          setError('Failed to sign in. Please try again.');
      }
      return;
    }

    // Successful login
    router.push("/dashboard");
  }

  return (
    <div className="flex flex-col justify-center items-center h-screen text-black">
      <div className="w-96 bg-white rounded shadow p-6">
        <h1 className="text-3xl font-bold mb-6">Sign In</h1>
        <form onSubmit={handleForm} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded">
              {error}
            </div>
          )}
          <div>
            <label htmlFor="email" className="block mb-1 font-medium">
              Email
            </label>
            <input
              onChange={(e) => setEmail(e.target.value)}
              required
              type="email"
              name="email"
              id="email"
              placeholder="example@mail.com"
              className="w-full border border-gray-300 rounded px-3 py-2"
              disabled={isLoading}
            />
          </div>
          <div>
            <label htmlFor="password" className="block mb-1 font-medium">
              Password
            </label>
            <input
              onChange={(e) => setPassword(e.target.value)}
              required
              type="password"
              name="password"
              id="password"
              placeholder="password"
              className="w-full border border-gray-300 rounded px-3 py-2"
              disabled={isLoading}
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-blue-500 text-white font-semibold py-2 rounded"
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
        </form>
      </div>
      <div className="w-96 p-6">
        <span>Don't have an account? <Link href="/signup" className="text-blue-500 hover:text-blue-600">Sign up</Link></span>
      </div>
    </div>
  );
}

export default Page;
