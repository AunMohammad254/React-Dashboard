import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import LogoIcon from "../assets/logo-icon.svg";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authMode, setAuthMode] = useState("signin"); // 'signin' | 'signup' | 'forgot-password'
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Trigger entrance animation
  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      if (authMode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        setMessage("Successfully signed in!");
      } else if (authMode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          // Ensure Supabase redirects back to current origin (dev/prod)
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        setMessage("Check your email for the confirmation link!");
      } else if (authMode === "forgot-password") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin,
        });
        if (error) throw error;
        setMessage("Check your email for the password reset link!");
      }
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className="min-h-screen flex items-center justify-center px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-12 relative overflow-hidden"
      role="main"
      aria-label="Authentication page"
      style={{
        background: 'var(--dark-gradient-primary)'
      }}
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 sm:-top-40 sm:-right-40 w-40 h-40 sm:w-80 sm:h-80 bg-linear-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-2xl sm:blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-20 -left-20 sm:-bottom-40 sm:-left-40 w-40 h-40 sm:w-80 sm:h-80 bg-linear-to-tr from-purple-400/20 to-pink-600/20 rounded-full blur-2xl sm:blur-3xl animate-pulse animate-delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 sm:w-96 sm:h-96 bg-linear-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-2xl sm:blur-3xl animate-pulse animate-delay-2000"></div>
      </div>

      <div className={`w-full max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl relative z-10 transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8 lg:mb-12">
          <div className={`mx-auto mb-3 sm:mb-4 lg:mb-6 w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 relative transition-all duration-700 ease-out ${isVisible ? 'scale-100 rotate-0' : 'scale-75 rotate-12'
            }`}>
            <div className="absolute inset-0 bg-linear-to-r from-blue-400 to-purple-600 rounded-2xl blur-lg opacity-50 animate-pulse"></div>
            <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl p-2 sm:p-3 lg:p-4 border border-white/20 hover:shadow-2xl transition-shadow duration-300">
              <img src={LogoIcon} alt="PitchCraft AI" className="w-full h-full filter drop-shadow-lg" />
            </div>
          </div>
          <h1 className={`text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-primary font-bold mb-2 sm:mb-3 transition-all duration-700 ease-out tracking-tight animate-delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}>
            <span className="bg-linear-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              PitchCraft AI
            </span>
          </h1>
          <p className={`text-gray-300 text-base sm:text-lg lg:text-xl font-medium max-w-md mx-auto leading-relaxed transition-all duration-700 ease-out animate-delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}>
            Transform your innovative ideas into compelling pitches
          </p>
        </div>

        {/* Auth Card */}
        <section
          className={`relative backdrop-blur-xl rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 xl:p-12 border shadow-2xl transition-all duration-700 ease-out animate-delay-600 ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'
            }`}
          role="region"
          aria-labelledby="auth-heading"
          aria-describedby="auth-description"
          style={{
            background: 'var(--dark-glass-bg)',
            borderColor: 'var(--dark-border-primary)',
            boxShadow: 'var(--dark-shadow-xl)'
          }}
        >
          {/* Card glow effect */}
          <div className="absolute inset-0 bg-linear-to-r from-blue-500/20 to-purple-500/20 rounded-2xl sm:rounded-3xl blur-xl opacity-50" aria-hidden="true"></div>

          <div className="relative z-10">
            <header className="text-center mb-6 sm:mb-8 lg:mb-10">
              <h1 id="auth-heading" className={`text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-primary font-bold mb-2 sm:mb-3 lg:mb-4 transition-all duration-500 ease-out`}
                style={{ color: 'var(--dark-text-primary)' }}>
                {authMode === 'signin' && (
                  <span className="flex items-center justify-center gap-3">
                    <span className="text-3xl">👋</span>
                    Welcome Back!
                  </span>
                )}
                {authMode === 'signup' && (
                  <span className="flex items-center justify-center gap-3">
                    <span className="text-3xl">🚀</span>
                    Get Started
                  </span>
                )}
                {authMode === 'forgot-password' && (
                  <span className="flex items-center justify-center gap-3">
                    <span className="text-3xl">🔐</span>
                    Reset Password
                  </span>
                )}
              </h1>
              <p id="auth-description" className="font-medium text-sm sm:text-base lg:text-lg leading-relaxed max-w-sm mx-auto"
                style={{ color: 'var(--dark-text-secondary)' }}>
                {authMode === 'signin' && "Sign in to continue creating amazing pitches"}
                {authMode === 'signup' && "Create your account to start building pitches"}
                {authMode === 'forgot-password' && "Enter your email to receive reset instructions"}
              </p>
            </header>

            <form
              onSubmit={handleSubmit}
              className="space-y-5 sm:space-y-6 lg:space-y-8"
              noValidate
              aria-label={authMode === 'signin' ? "Sign in form" : authMode === 'signup' ? "Create account form" : "Reset password form"}
            >
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="block text-sm sm:text-base font-medium mb-2"
                  style={{ color: 'var(--dark-text-secondary)' }}
                >
                  Email Address <span className="text-red-400" aria-label="required">*</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 sm:px-5 sm:py-4 lg:py-5 backdrop-blur-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 ease-out text-base sm:text-lg"
                  placeholder="Enter your email address"
                  aria-required="true"
                  aria-describedby="email-help"
                  autoComplete="email"
                  style={{
                    background: 'var(--dark-input-bg)',
                    borderColor: 'var(--dark-border-secondary)',
                    color: 'var(--dark-text-primary)'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--dark-border-focus)';
                    e.target.style.background = 'var(--dark-input-focus-bg)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'var(--dark-border-secondary)';
                    e.target.style.background = 'var(--dark-input-bg)';
                  }}
                />
                <div id="email-help" className="sr-only">
                  Enter a valid email address to {authMode === 'signin' ? 'sign in' : authMode === 'signup' ? 'create your account' : 'reset your password'}
                </div>
              </div>

              {authMode !== 'forgot-password' && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center mb-2">
                    <label
                      htmlFor="password"
                      className="block text-sm sm:text-base font-medium"
                      style={{ color: 'var(--dark-text-secondary)' }}
                    >
                      Password <span className="text-red-400" aria-label="required">*</span>
                    </label>
                    {authMode === 'signin' && (
                      <button
                        type="button"
                        onClick={() => setAuthMode('forgot-password')}
                        className="text-sm font-medium hover:underline focus:outline-none"
                        style={{ color: '#60a5fa' }}
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full px-4 py-3 sm:px-5 sm:py-4 lg:py-5 backdrop-blur-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 ease-out pr-12 sm:pr-14 text-base sm:text-lg"
                      placeholder="Enter your password"
                      minLength={6}
                      aria-required="true"
                      aria-describedby="password-help"
                      autoComplete={authMode === 'signin' ? "current-password" : "new-password"}
                      style={{
                        background: 'var(--dark-input-bg)',
                        borderColor: 'var(--dark-border-secondary)',
                        color: 'var(--dark-text-primary)'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = 'var(--dark-border-focus)';
                        e.target.style.background = 'var(--dark-input-focus-bg)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'var(--dark-border-secondary)';
                        e.target.style.background = 'var(--dark-input-bg)';
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 transition-colors duration-200 p-1 sm:p-2 touch-manipulation focus:outline-none focus:ring-2 focus:ring-blue-500/50 rounded"
                      style={{
                        color: 'var(--dark-text-muted)',
                        '--hover-color': 'var(--dark-text-primary)'
                      }}
                      onMouseEnter={(e) => e.target.style.color = 'var(--dark-text-primary)'}
                      onMouseLeave={(e) => e.target.style.color = 'var(--dark-text-muted)'}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      aria-pressed={showPassword}
                      tabIndex={0}
                    >
                      {showPassword ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-5 h-5 sm:w-6 sm:h-6"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 11-4.243-4.243m4.242 4.242L9.88 9.88"
                          />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-5 h-5 sm:w-6 sm:h-6"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                  <div id="password-help" className="sr-only">
                    Password must be at least 6 characters long
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 sm:py-5 lg:py-6 px-6 font-semibold text-base sm:text-lg lg:text-xl rounded-2xl
                         transition-all duration-300 ease-out transform
                         hover:scale-105 hover:shadow-2xl active:scale-95
                         disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                         focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-transparent
                         relative overflow-hidden group touch-manipulation"
                style={{
                  background: loading
                    ? 'var(--dark-gradient-secondary)'
                    : 'var(--dark-button-primary-bg)',
                  color: loading
                    ? 'var(--dark-text-disabled)'
                    : 'var(--dark-text-primary)',
                  border: `1px solid ${loading ? 'var(--dark-border-tertiary)' : 'var(--dark-border-primary)'}`,
                  boxShadow: loading ? 'none' : 'var(--dark-shadow-md)'
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.target.style.background = 'var(--dark-button-primary-hover)';
                    e.target.style.borderColor = 'var(--dark-border-hover)';
                    e.target.style.boxShadow = 'var(--dark-shadow-lg)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.target.style.background = 'var(--dark-button-primary-bg)';
                    e.target.style.borderColor = 'var(--dark-border-primary)';
                    e.target.style.boxShadow = 'var(--dark-shadow-md)';
                  }
                }}
                aria-describedby="submit-help"
                aria-live="polite"
              >
                {/* Button glow effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-2xl"
                  style={{ background: 'var(--dark-gradient-primary)' }}
                  aria-hidden="true"></div>

                <span className="relative z-10 flex items-center justify-center gap-3">
                  {loading ? (
                    <>
                      <div
                        className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-t-transparent rounded-full animate-spin"
                        style={{ borderColor: 'var(--dark-text-disabled)', borderTopColor: 'transparent' }}
                        aria-hidden="true"
                      ></div>
                      <span>
                        {authMode === 'signin' ? "Signing In..." : authMode === 'signup' ? "Creating Account..." : "Sending..."}
                      </span>
                    </>
                  ) : (
                    <>
                      {authMode === 'signin' ? (
                        <>
                          <span className="text-xl" aria-hidden="true">🔐</span>
                          <span>Sign In</span>
                        </>
                      ) : authMode === 'signup' ? (
                        <>
                          <span className="text-xl" aria-hidden="true">✨</span>
                          <span>Create Account</span>
                        </>
                      ) : (
                        <>
                          <span className="text-xl" aria-hidden="true">📧</span>
                          <span>Send Instructions</span>
                        </>
                      )}
                    </>
                  )}
                </span>

                {/* Ripple effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" aria-hidden="true">
                  <div className="absolute inset-0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full 
                                transition-transform duration-700 ease-out rounded-2xl"
                    style={{ background: 'linear-gradient(to right, transparent, var(--dark-text-primary-10), transparent)' }}></div>
                </div>
              </button>
              <div id="submit-help" className="sr-only">
                {loading
                  ? `Please wait while we ${authMode === 'signin' ? 'sign you in' : authMode === 'signup' ? 'create your account' : 'process your request'}`
                  : `Click to ${authMode === 'signin' ? 'sign in to your account' : authMode === 'signup' ? 'create a new account' : 'send password reset email'}`
                }
              </div>
            </form>

            <div className="mt-6 sm:mt-8 lg:mt-10 text-center space-y-4">
              {authMode !== 'forgot-password' ? (
                <>
                  <p className="text-sm sm:text-base lg:text-lg mb-3 sm:mb-4"
                    style={{ color: 'var(--dark-text-secondary)' }}>
                    {authMode === 'signin' ? "Don't have an account?" : "Already have an account?"}
                  </p>
                  <button
                    type="button"
                    onClick={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')}
                    className="underline transition-colors duration-200 text-sm sm:text-base lg:text-lg font-medium"
                    style={{
                      color: 'var(--dark-text-secondary)',
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.color = 'var(--dark-text-primary)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.color = 'var(--dark-text-secondary)';
                    }}
                  >
                    {authMode === 'signin' ? "Don't have an account? Create one" : "Already have an account? Sign in"}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setAuthMode('signin')}
                  className="font-medium hover:underline focus:outline-none text-sm sm:text-base lg:text-lg"
                  style={{ color: 'var(--dark-text-secondary)' }}
                >
                  ← Back to Sign In
                </button>
              )}
            </div>

            {message && (
              <div
                className={`mt-4 sm:mt-6 lg:mt-8 p-3 sm:p-4 lg:p-5 rounded-xl sm:rounded-2xl text-sm sm:text-base lg:text-lg font-medium 
                          backdrop-blur-sm border transition-all duration-500 ease-out
                          animate-fade-in-up ${message.includes("error") ||
                    message.includes("Error") ||
                    message.includes("Invalid")
                    ? "bg-red-500/10 border-red-500/30 text-red-200"
                    : "bg-green-500/10 border-green-500/30 text-green-200"
                  }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-xl shrink-0 mt-0.5">
                    {message.includes("error") ||
                      message.includes("Error") ||
                      message.includes("Invalid")
                      ? "❌"
                      : "✅"}
                  </span>
                  <span className="leading-relaxed">{message}</span>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Features Preview */}
        <section
          className={`mt-12 sm:mt-16 transition-all duration-1000 ease-out animate-delay-800 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          aria-label="Platform features"
        >
          <div className="grid grid-cols-3 gap-4 sm:gap-6">
            <article className="group text-center p-4 sm:p-6 rounded-2xl backdrop-blur-sm border transition-all duration-300 ease-out hover:scale-105 hover:shadow-xl"
              role="article"
              aria-labelledby="feature-ai"
              style={{
                background: 'var(--dark-card-bg)',
                borderColor: 'var(--dark-border-secondary)'
              }}>
              <div className="text-2xl sm:text-3xl mb-2 sm:mb-3 group-hover:scale-110 transition-transform duration-300" aria-hidden="true">🤖</div>
              <p id="feature-ai" className="text-sm sm:text-base font-medium transition-colors duration-300"
                style={{ color: 'var(--dark-text-secondary)' }}>
                AI-Powered
              </p>
            </article>
            <article className="group text-center p-4 sm:p-6 rounded-2xl backdrop-blur-sm border transition-all duration-300 ease-out hover:scale-105 hover:shadow-xl"
              role="article"
              aria-labelledby="feature-speed"
              style={{
                background: 'var(--dark-card-bg)',
                borderColor: 'var(--dark-border-secondary)'
              }}>
              <div className="text-2xl sm:text-3xl mb-2 sm:mb-3 group-hover:scale-110 transition-transform duration-300" aria-hidden="true">⚡</div>
              <p id="feature-speed" className="text-sm sm:text-base font-medium transition-colors duration-300"
                style={{ color: 'var(--dark-text-secondary)' }}>
                Lightning Fast
              </p>
            </article>
            <article className="group text-center p-4 sm:p-6 rounded-2xl backdrop-blur-sm border transition-all duration-300 ease-out hover:scale-105 hover:shadow-xl"
              role="article"
              aria-labelledby="feature-security"
              style={{
                background: 'var(--dark-card-bg)',
                borderColor: 'var(--dark-border-secondary)'
              }}>
              <div className="text-2xl sm:text-3xl mb-2 sm:mb-3 group-hover:scale-110 transition-transform duration-300" aria-hidden="true">🔒</div>
              <p id="feature-security" className="text-sm sm:text-base font-medium transition-colors duration-300"
                style={{ color: 'var(--dark-text-secondary)' }}>
                Secure
              </p>
            </article>
          </div>
        </section>
      </div>
    </main>
  );
}
