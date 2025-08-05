import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { LogIn, Mail, Lock, ArrowRight, Loader, Eye, EyeOff } from "lucide-react";
import { useUserStore } from "../store/useUserStore";

const LoginPage = () => {
    const { login , loading} = useUserStore();
    const [ showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
      email: "",
      password: "",
    });
  
    const handleSubmit = (e) => {
      e.preventDefault();
      login(formData);
    };
  
  
    return (
      <div className='flex flex-col justify-center py-12 sm:px-6 lg:px-8'>
        <motion.div
          className='sm:mx-auto sm:w-full sm:max-w-md'
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}      
        >
          <h2 className='mt-6 text-center text-3xl font-extrabold text-emerald-400'>Login</h2>
        </motion.div>
        <motion.div
          className='mt-8 sm:mx-auto sm:w-full sm:max-w-md'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}      
        >
          <div className='bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10'>
            <form onSubmit={handleSubmit} className='space-y-6'>
              <div>
                <label htmlFor='email' className='block text:sm font-medium text-gray-300'>
                  Email address
                </label>
                <div className='mt-1 relative rounded-md shadow-sm'>
                  <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                    <Mail className='h-5 w-5 text-gray-400' aria-hidden='true' />
                  </div>
                  <input
                    id='email'
                    type='email'
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className='block w-full px-3 py-2 pl-10 bg-gray-700 border border-gray-600 rounded-md shadow-sm
                    placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-small'
                    placeholder='name@gmail.com'
                  />
                </div>
              </div>
              <div>
                <label htmlFor='password' className='block text:sm font-medium text-gray-300'>
                  Password
                </label>
                <div className='mt-1 relative rounded-md shadow-sm'>
                  <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                    <Lock className='h-5 w-5 text-gray-400' aria-hidden='true' />
                  </div>
                  <input
                    id='password'
                    type= {showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className='block w-full px-3 py-2 pl-10 bg-gray-700 border border-gray-600 rounded-md shadow-sm
                    placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-small'
                    placeholder='******'
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className='absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-200'
                  >
                    { showPassword ? (<Eye className='h-4 w-4' />) :(<EyeOff className='h-4 w-4' />) }
                  </button>
                </div>
              </div>
  
              <button
              type='submit'
              className='w-full flex justify-center py-2 px-4 border border-transparent 
              rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600
              hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2
              focus:ring-emerald-500 transition duration-150 ease-in-out disabled:opacity-50'
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader className='mr-2 h-5 w-5 animate-spin' aria-hidden='true' />
                  Loading...
                </>
                ) : (
                <>
                  <LogIn className='mr-2 h-5 w-5' aria-hidden='true' />
                    Login
                  </>
              )}
            </button>
            </form>
            <p className='mt-8 text-center text-sm text-gray-400'>
              Not a member?{" "}
              <Link to='/signup' className='font-medium text-emerald-400 hover:text-emerald-300'>
                Sign up now <ArrowRight className='inline h-4 w-4' />
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    )
  }

export default LoginPage