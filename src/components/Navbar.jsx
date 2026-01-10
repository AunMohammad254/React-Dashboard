import { useRef, useEffect } from "react";
import LogoIcon from "../assets/logo-icon.svg";
import { NavButton, MobileNavItem, MobileMenuButton } from "./Button";

export default function Navbar({
    user,
    currentView,
    setCurrentView,
    mobileMenuOpen,
    setMobileMenuOpen,
    onSignOut,
}) {
    const navRef = useRef(null);

    // Close mobile menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (navRef.current && !navRef.current.contains(event.target) && mobileMenuOpen) {
                setMobileMenuOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [mobileMenuOpen, setMobileMenuOpen]);

    return (
        <nav
            ref={navRef}
            className={`
        fixed top-4 left-4 right-4 z-50 rounded-2xl
        transition-all duration-300 ease-in-out
        border border-white/10 shadow-2xl
        ${mobileMenuOpen ? "bg-[var(--dark-bg-overlay)]" : "bg-[var(--dark-glass-bg)]"}
        backdrop-blur-xl
      `}
            role="navigation"
            aria-label="Main navigation"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16 sm:h-20">
                    {/* Logo Section */}
                    <div className="flex items-center gap-3 animate-fade-in-left cursor-pointer group"
                        onClick={() => setCurrentView("generate")}>
                        <div className="relative w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl border border-white/10 group-hover:scale-105 transition-transform duration-300 shadow-lg group-hover:shadow-blue-500/20">
                            <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <img
                                src={LogoIcon}
                                alt="PitchCrafter Logo"
                                className="w-6 h-6 sm:w-8 sm:h-8 relative z-10"
                            />
                        </div>
                        <div className="flex flex-col">
                            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 group-hover:to-pink-300 transition-all duration-300">
                                Pitch Crafter
                            </h1>
                            <span className="text-[10px] sm:text-xs font-medium text-neutral-400 tracking-wider">AI STARTUP ASSISTANT</span>
                        </div>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-4 animate-fade-in-right">
                        <div className="flex items-center bg-white/5 backdrop-blur-md rounded-2xl p-1.5 border border-white/5 shadow-inner">
                            <NavButton
                                onClick={() => setCurrentView("generate")}
                                isActive={currentView === "generate"}
                                aria-label="Generate new pitch"
                            >
                                <span className="mr-2">✨</span>
                                <span>Generate</span>
                            </NavButton>
                            <NavButton
                                onClick={() => setCurrentView("my-pitches")}
                                isActive={currentView === "my-pitches"}
                                aria-label="View my pitches"
                            >
                                <span className="mr-2">📚</span>
                                <span>My Pitches</span>
                            </NavButton>
                        </div>

                        <div className="h-8 w-px bg-white/10 mx-2"></div>

                        <NavButton
                            onClick={onSignOut}
                            variant="danger"
                            className="!px-4"
                            aria-label="Sign out"
                        >
                            <span className="mr-2">👋</span>
                            <span>Sign Out</span>
                        </NavButton>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center">
                        <MobileMenuButton
                            isOpen={mobileMenuOpen}
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        />
                    </div>
                </div>
            </div>

            {/* Mobile Navigation Menu */}
            <div
                className={`
          md:hidden overflow-hidden transition-all duration-300 ease-in-out
          ${mobileMenuOpen ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"}
        `}
            >
                <div className="px-4 pb-6 space-y-4">
                    {/* Navigation Links */}
                    <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500 px-2 mb-2">Menu</p>
                        <MobileNavItem
                            onClick={() => {
                                setCurrentView("generate");
                                setMobileMenuOpen(false);
                            }}
                            active={currentView === "generate"}
                        >
                            <span className="mr-3 text-xl bg-blue-500/10 w-8 h-8 flex items-center justify-center rounded-lg">✨</span>
                            <div className="flex-1">
                                <div className="font-semibold text-neutral-200">Generate Pitch</div>
                                <div className="text-xs text-neutral-400">Create a new startup pitch</div>
                            </div>
                        </MobileNavItem>

                        <MobileNavItem
                            onClick={() => {
                                setCurrentView("my-pitches");
                                setMobileMenuOpen(false);
                            }}
                            active={currentView === "my-pitches"}
                        >
                            <span className="mr-3 text-xl bg-purple-500/10 w-8 h-8 flex items-center justify-center rounded-lg">📚</span>
                            <div className="flex-1">
                                <div className="font-semibold text-neutral-200">My Pitches</div>
                                <div className="text-xs text-neutral-400">View and manage library</div>
                            </div>
                        </MobileNavItem>
                    </div>

                    {/* Account Actions */}
                    <div className="pt-4 border-t border-white/10">
                        <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500 px-2 mb-2">Account</p>
                        <MobileNavItem
                            onClick={() => {
                                onSignOut();
                                setMobileMenuOpen(false);
                            }}
                            className="hover:bg-red-500/10 group"
                        >
                            <span className="mr-3 text-xl bg-red-500/10 w-8 h-8 flex items-center justify-center rounded-lg group-hover:bg-red-500/20 transition-colors">👋</span>
                            <div className="flex-1">
                                <div className="font-semibold text-red-400 group-hover:text-red-300">Sign Out</div>
                                <div className="text-xs text-red-500/60 group-hover:text-red-400/80">Log out of your session</div>
                            </div>
                        </MobileNavItem>
                    </div>
                </div>
            </div>
        </nav>
    );
}
