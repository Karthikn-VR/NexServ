import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

import {
  Utensils,
  Search,
  ShoppingBag,
  Star,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Facebook,
  Twitter,
  Instagram,
  Pizza,
  Cake,
  Salad,
  Beef,
} from 'lucide-react';

// Curated hero dish (manually picked strong dish)
const HERO_DISH = {
  strMeal: 'Grilled Steak with Garden Salad',
  strMealThumb:
    'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=900&q=80&auto=format&fit=crop',
  description:
    'Navigating the journey of fresh ingredients to deliver uncompromised taste and nutrition. Precision in every bite — mastering the art of speed without sacrificing quality.',
};

const CUISINE_CATEGORIES = [
  {
    name: 'Salad',
    icon: Salad,
    img: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80&auto=format&fit=crop',
  },
  {
    name: 'Burger',
    icon: Beef,
    img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80&auto=format&fit=crop',
  },
  {
    name: 'Pizza',
    icon: Pizza,
    img: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&q=80&auto=format&fit=crop',
  },
  {
    name: 'Dessert',
    icon: Cake,
    img: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600&q=80&auto=format&fit=crop',
  },
];

// Map raw MealDB record into a normalised product
const mapMeal = (meal, idx = 0) => ({
  id: meal.idMeal,
  name: meal.strMeal,
  thumb: meal.strMealThumb,
  category: meal.strCategory || 'Salad',
  price: 199 + (idx % 6) * 60,
  rating: (4.5 + ((idx * 7) % 5) / 10).toFixed(1),
});

export const LandingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [carousel, setCarousel] = useState([]);
  const [cards, setCards] = useState([]);
  const [activeSlide, setActiveSlide] = useState(0);
  const [activeSection, setActiveSection] = useState('home');
  const carouselTimer = useRef(null);

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '-40% 0px -40% 0px',
      threshold: 0,
    };

    const handleIntersect = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const handleScroll = () => {
      // Check if user has scrolled to the bottom of the page
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 10) {
        setActiveSection('contact');
      }
    };

    const observer = new IntersectionObserver(handleIntersect, observerOptions);
    const sections = ['home', 'menu', 'about', 'contact'];
    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    window.addEventListener('scroll', handleScroll);

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    if (isAuthenticated) navigate('/menu');
  }, [isAuthenticated, navigate]);

  // Carousel data (Beef + Chicken mash for visual variety) with fallback
  useEffect(() => {
    const fetchCarousel = async () => {
      try {
        const res = await fetch(
          'https://www.themealdb.com/api/json/v1/1/filter.php?c=Beef'
        );
        const data = await res.json();
        if (data?.meals?.length) {
          setCarousel(data.meals.slice(0, 7).map((m, i) => mapMeal(m, i)));
        } else {
          throw new Error('empty');
        }
      } catch {
        setCarousel(
          Array.from({ length: 5 }).map((_, i) => ({
            id: `f-${i}`,
            name: 'Signature Bowl',
            thumb: HERO_DISH.strMealThumb,
            category: 'Special',
            price: 299 + i * 40,
            rating: '4.8',
          }))
        );
      }
    };

    const fetchCards = async () => {
      try {
        const res = await fetch(
          'https://www.themealdb.com/api/json/v1/1/filter.php?c=Chicken'
        );
        const data = await res.json();
        if (data?.meals?.length) {
          setCards(data.meals.slice(0, 4).map((m, i) => mapMeal(m, i + 2)));
        } else {
          throw new Error('empty');
        }
      } catch {
        setCards(
          Array.from({ length: 4 }).map((_, i) => ({
            id: `c-${i}`,
            name: 'Steak Vasitable',
            thumb: HERO_DISH.strMealThumb,
            category: 'Salad',
            price: 199 + i * 40,
            rating: '4.7',
          }))
        );
      }
    };

    fetchCarousel();
    fetchCards();
  }, []);

  // Auto rotate carousel
  useEffect(() => {
    if (!carousel.length) return;
    carouselTimer.current = setInterval(() => {
      setActiveSlide((s) => (s + 1) % carousel.length);
    }, 3500);
    return () => clearInterval(carouselTimer.current);
  }, [carousel.length]);

  const goPrev = () =>
    setActiveSlide((s) => (s - 1 + carousel.length) % carousel.length);
  const goNext = () => setActiveSlide((s) => (s + 1) % carousel.length);

  // Build 5-slot carousel window centred on activeSlide
  const carouselWindow = () => {
    if (!carousel.length) return [];
    const offsets = [-2, -1, 0, 1, 2];
    return offsets.map((o) => {
      const idx = (activeSlide + o + carousel.length) % carousel.length;
      return { ...carousel[idx], _pos: o };
    });
  };

  return (
    <div
      className="min-h-screen bg-[#0a0806] text-white font-sans selection:bg-orange-500/30 overflow-x-hidden"
      data-testid="landing-page"
      style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
    >
      {/* ============ NAV ============ */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0806]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between">
          <Link to="/" data-testid="brand-logo" className="flex items-center space-x-2 shrink-0">
            <div className="w-7 h-7 md:w-10 md:h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg md:rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30">
              <Utensils className="text-white w-3.5 h-3.5 md:w-5 md:h-5" />
            </div>
            <span className="text-lg md:text-2xl font-extrabold tracking-tight">
              <span className="text-orange-500">Nex</span>Serv
            </span>
          </Link>

          <div className="hidden lg:flex items-center space-x-8 text-sm font-medium text-gray-400">
            {[
              { id: 'home', label: 'Home' },
              { id: 'menu', label: 'Explore' },
              { id: 'about', label: 'Cuisine' },
              { id: 'contact', label: 'Contact' },
            ].map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={`relative transition-all duration-300 hover:text-white group ${
                  activeSection === item.id ? 'text-orange-500 font-bold' : ''
                }`}
              >
                {item.label}
                <span
                  className={`absolute -bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-orange-500 transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1) ${
                    activeSection === item.id ? 'opacity-100 scale-100 translate-y-0 shadow-[0_0_10px_#ffa500]' : 'opacity-0 scale-0 translate-y-2'
                  }`}
                />
              </a>
            ))}
          </div>

          <div className="flex items-center space-x-1.5 md:space-x-4">
            <div className="hidden sm:flex items-center bg-white/5 border border-white/10 rounded-full px-4 py-2 w-32 md:w-56">
              <Search className="w-4 h-4 text-gray-400 shrink-0" />
              <input
                placeholder="Search..."
                className="bg-transparent ml-2 text-xs outline-none w-full text-white placeholder:text-gray-500"
                data-testid="nav-search-input"
              />
            </div>
            <button className="relative p-1.5 md:p-2 text-gray-300 hover:text-white shrink-0" data-testid="nav-cart-btn">
              <ShoppingBag className="w-4 h-4 md:w-5 md:h-5" />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-orange-500 rounded-full" />
            </button>
            <Link
              to="/login"
              data-testid="nav-login-btn"
              className="hidden xs:inline-flex px-3 md:px-5 py-1.5 md:py-2 rounded-full text-[10px] md:text-sm font-semibold text-white border border-white/15 hover:bg-white/10 transition-all"
            >
              Login
            </Link>
            <Link
              to="/login"
              data-testid="nav-signup-btn"
              className="px-3 md:px-5 py-1.5 md:py-2 rounded-full bg-orange-500 hover:bg-orange-600 text-white text-[10px] md:text-sm font-semibold shadow-lg shadow-orange-500/30 transition-all"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      {/* ============ HERO (image #1 inspired) ============ */}
      <section
        id="home"
        className="relative pt-16 md:pt-32 pb-4 md:pb-16 px-3 md:px-6 max-w-7xl mx-auto min-h-[60vh] md:min-h-screen flex items-center"
      >
        {/* decorative leaves */}
        <div className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 text-green-500/30 opacity-40 md:opacity-100">
          <svg width="40" height="40" md:width="120" md:height="120" viewBox="0 0 100 100" fill="currentColor">
            <path d="M50 10 C 30 30 30 60 50 80 C 70 60 70 30 50 10 Z" />
          </svg>
        </div>
        <div className="absolute -left-10 bottom-10 w-32 md:w-72 h-32 md:h-72 bg-green-500/10 rounded-full blur-[40px] md:blur-[120px]" />
        <div className="absolute right-0 top-1/4 w-48 md:w-96 h-48 md:h-96 bg-orange-500/10 rounded-full blur-[60px] md:blur-[140px]" />

        <div className="grid lg:grid-cols-2 gap-4 md:gap-12 items-center w-full relative z-10">
          {/* LEFT */}
          <div className="space-y-3 md:space-y-8 text-center lg:text-left">
            <div className="flex flex-col gap-1 md:gap-2 items-center lg:items-start">
              {/* socials column */}
              <div className="flex items-center gap-3 text-gray-500 text-[8px] md:text-[10px]">
                <Facebook className="w-3 h-3 md:w-3.5 md:h-3.5 hover:text-orange-500 cursor-pointer" />
                <Twitter className="w-3 h-3 md:w-3.5 md:h-3.5 hover:text-orange-500 cursor-pointer" />
                <Instagram className="w-3 h-3 md:w-3.5 md:h-3.5 hover:text-orange-500 cursor-pointer" />
                <span className="h-px w-6 md:w-8 bg-white/10" />
              </div>
              <p
                className="text-orange-400 text-base md:text-2xl mt-1"
                style={{ fontFamily: "'Caveat', 'Brush Script MT', cursive" }}
                data-testid="hero-eyebrow"
              >
                Its Quick &amp; Amusing!
              </p>
              <h1
                className="text-3xl md:text-responsive-h1 font-extrabold leading-[1.1] tracking-tight"
                data-testid="hero-title"
                style={{ fontFamily: "'Fraunces', Georgia, serif" }}
              >
                <span className="text-orange-500">Elevating</span> Food
                <br />
                Quality in <span className="italic font-light">No Time</span>
              </h1>
              <p className="text-gray-400 text-[10px] md:text-base max-w-xs md:max-w-md leading-relaxed mt-1.5 md:mt-4 mx-auto lg:mx-0">
                {HERO_DISH.description}
              </p>
            </div>

            <div className="flex items-center justify-center lg:justify-start gap-2.5 md:gap-4">
              <a
                href="#menu"
                data-testid="hero-cta-see-menu"
                className="px-4 md:px-8 py-2 md:py-3.5 bg-orange-500 hover:bg-orange-600 rounded-full font-semibold text-white shadow-xl shadow-orange-500/30 transition-all inline-flex items-center gap-1.5 group text-[11px] md:text-base"
              >
                See Menu
                <ArrowRight className="w-3 h-3 md:w-3.5 md:h-3.5 group-hover:translate-x-1 transition-transform" />
              </a>
              <a
                href="#cuisine"
                className="px-4 md:px-8 py-2 md:py-3.5 rounded-full border border-white/15 hover:bg-white/5 font-semibold text-[10px] md:text-sm transition-all"
              >
                Explore
              </a>
            </div>

            <div className="flex items-center justify-center lg:justify-start space-x-2 pt-1">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-6 h-6 md:w-10 md:h-10 rounded-full border-2 border-[#0a0806] overflow-hidden"
                  >
                    <img
                      src={`https://i.pravatar.cc/100?u=${i}`}
                      alt="user"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
              <div className="text-left">
                <div className="flex items-center gap-0.5 text-orange-500">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="w-2 md:w-3 h-2 md:h-3 fill-current" />
                  ))}
                </div>
                <p className="text-[8px] md:text-xs text-gray-400 font-medium">10k+ happy customers</p>
              </div>
            </div>
          </div>

          {/* RIGHT — plate w/ leaves */}
          <div className="relative flex items-center justify-center mt-6 lg:mt-0">
            {/* big leaf behind */}
            <svg
              className="absolute -right-3 md:-right-10 top-0 w-[240px] h-[240px] md:w-[520px] md:h-[520px] text-green-600/70 -z-0"
              viewBox="0 0 200 200"
              fill="currentColor"
            >
              <path d="M100 10 C 40 40 30 110 60 170 C 90 200 150 180 175 130 C 195 90 170 30 100 10 Z" />
              <path
                d="M100 30 C 90 80 95 130 110 170"
                stroke="rgba(0,0,0,0.25)"
                strokeWidth="2"
                fill="none"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-[220px] h-[220px] md:w-[460px] md:h-[460px] rounded-full border border-orange-400/30" />
            </div>

            <div className="relative animate-float-slow z-10">
              <div className="absolute inset-0 rounded-full bg-orange-500/20 blur-2xl scale-90 -z-10" />
              <img
                src={HERO_DISH.strMealThumb}
                alt={HERO_DISH.strMeal}
                data-testid="hero-dish-image"
                className="w-full max-w-[200px] md:max-w-[420px] max-h-[200px] md:max-h-[400px] object-cover rounded-full shadow-[0_20px_60px_-15px_rgba(0,0,0,0.9)] border-[3px] md:border-[6px] border-white/[0.04]"
              />
              {/* orbit floats */}
              <div className="absolute -top-3 left-1 w-8 h-8 md:w-20 md:h-20 rounded-full bg-[#1a1410]/80 backdrop-blur-md p-1 md:p-2 border border-white/10 shadow-xl animate-bounce-slow">
                <img
                  src="https://www.themealdb.com/images/ingredients/Lime.png"
                  alt="lime"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="absolute top-1/3 -right-1 md:-right-4 w-7 h-7 md:w-16 md:h-16 rounded-full bg-[#1a1410]/80 backdrop-blur-md p-1 md:p-2 border border-white/10 shadow-xl animate-float-slow">
                <img
                  src="https://www.themealdb.com/images/ingredients/Chilli.png"
                  alt="chilli"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="absolute -bottom-1 right-4 md:right-10 w-8 h-8 md:w-20 md:h-20 rounded-full bg-[#1a1410]/80 backdrop-blur-md p-1 md:p-2 border border-white/10 shadow-xl animate-bounce-slow">
                <img
                  src="https://www.themealdb.com/images/ingredients/Garlic.png"
                  alt="garlic"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ BEST FOOD CAROUSEL (image #2) ============ */}
      <section className="relative py-12 md:py-24 px-4 md:px-6 bg-[#070504] overflow-hidden">
        <div className="max-w-6xl mx-auto text-center mb-8 md:mb-16">
          <h2
            className="text-2xl md:text-responsive-h2 font-extrabold tracking-tight"
            style={{ fontFamily: "'Fraunces', Georgia, serif" }}
            data-testid="best-food-title"
          >
            Provide the <span className="text-orange-500">best food</span> for you
          </h2>
          <div className="w-12 md:w-24 h-1 bg-orange-500 mx-auto mt-3 md:mt-6 rounded-full" />
          <p className="text-gray-400 max-w-sm md:max-w-xl mx-auto mt-3 md:mt-6 text-[10px] md:text-sm leading-relaxed">
            We provide the best and most delicious food based on high quality
            ingredients that are maintained by high tech machines and cooked by our experts.
          </p>
        </div>

        <div className="relative max-w-6xl mx-auto h-[350px] md:h-[460px] flex items-center justify-center">
          <button
            onClick={goPrev}
            data-testid="carousel-prev"
            className="absolute left-0 md:left-4 z-30 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/5 hover:bg-orange-500 border border-white/10 flex items-center justify-center transition-all"
          >
            <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
          </button>

          <div className="relative w-full h-full flex items-center justify-center overflow-hidden md:overflow-visible">
            {carouselWindow().map((item) => {
              const pos = item._pos;
              const isCenter = pos === 0;
              const scale = isCenter ? 1 : Math.abs(pos) === 1 ? 0.78 : 0.55;
              const translate = pos * (window.innerWidth < 768 ? 160 : 220);
              const opacity = isCenter ? 1 : Math.abs(pos) === 1 ? 0.7 : 0.3;
              const z = 10 - Math.abs(pos);
              return (
                <div
                  key={`${item.id}-${pos}`}
                  className="absolute transition-all duration-700 ease-out"
                  style={{
                    transform: `translateX(${translate}px) scale(${scale})`,
                    opacity,
                    zIndex: z,
                  }}
                  data-testid={isCenter ? 'carousel-active-card' : undefined}
                >
                  <div className="relative w-[220px] md:w-[300px] h-[300px] md:h-[400px] rounded-[30px] md:rounded-[40px] bg-gradient-to-br from-[#1a1410] to-[#0d0a07] border border-white/5 p-4 md:p-6 flex flex-col items-center justify-center shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)]">
                    {isCenter && (
                      <div className="absolute -top-2 md:-top-3 left-1/2 -translate-x-1/2 px-3 md:px-4 py-1 md:py-1.5 bg-black border border-orange-500/40 rounded-md">
                        <span
                          className="text-orange-500 text-[10px] md:text-xs font-extrabold tracking-widest"
                          data-testid="hot-deals-badge"
                        >
                          HOT DEALS
                        </span>
                      </div>
                    )}
                    <img
                      src={item.thumb}
                      alt={item.name}
                      className="w-full max-w-[160px] md:max-w-[224px] max-h-[160px] md:max-h-[224px] object-cover rounded-full shadow-2xl"
                    />
                    <h4 className="mt-4 md:mt-6 font-bold text-center text-sm md:text-base truncate w-full">
                      {item.name}
                    </h4>
                    <p className="text-[10px] md:text-xs text-gray-500 mt-1">{item.category}</p>
                    {isCenter && (
                      <div className="absolute -bottom-3 md:-bottom-4 right-3 md:right-4 bg-black border border-white/10 rounded-lg px-3 md:px-4 py-1.5 md:py-2 shadow-lg">
                        <span className="text-gray-500 line-through text-[10px] md:text-xs mr-2">
                          ₹{item.price + 80}
                        </span>
                        <span className="text-orange-500 font-extrabold text-base md:text-lg">
                          ₹{item.price}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={goNext}
            data-testid="carousel-next"
            className="absolute right-0 md:right-4 z-30 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/5 hover:bg-orange-500 border border-white/10 flex items-center justify-center transition-all"
          >
            <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-10">
          {carousel.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveSlide(i)}
              data-testid={`carousel-dot-${i}`}
              className={`h-2 rounded-full transition-all ${
                i === activeSlide
                  ? 'bg-orange-500 w-8'
                  : 'bg-white/20 w-2 hover:bg-white/40'
              }`}
            />
          ))}
        </div>
      </section>

      {/* ============ FRESH FLAVORS (image #3 top) ============ */}
      <section id="menu" className="relative py-16 md:py-24 px-4 md:px-6 bg-[#0a0806] overflow-hidden">
        {/* curved decorative lines */}
        <svg
          className="absolute -left-32 top-1/2 -translate-y-1/2 w-64 md:w-96 h-64 md:h-96 text-white/5 opacity-50 md:opacity-100"
          viewBox="0 0 200 200"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.6"
        >
          <circle cx="100" cy="100" r="40" />
          <circle cx="100" cy="100" r="60" />
          <circle cx="100" cy="100" r="80" />
          <circle cx="100" cy="100" r="100" />
        </svg>

        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-8 md:gap-12 items-center relative z-10">
          <div className="rounded-3xl overflow-hidden shadow-2xl border border-white/5 order-2 lg:order-1">
            <img
              src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=900&q=80&auto=format&fit=crop"
              alt="Fresh flavors spread"
              className="w-full h-[300px] md:h-[420px] object-cover"
            />
          </div>
          <div className="space-y-6 text-center lg:text-left order-1 lg:order-2">
            <h2
              className="text-responsive-h2 font-extrabold leading-tight tracking-tight"
              style={{ fontFamily: "'Fraunces', Georgia, serif" }}
              data-testid="fresh-flavors-title"
            >
              Fresh flavors. <br />
              Every craving.
            </h2>
            <p className="text-gray-400 text-sm md:text-base leading-relaxed max-w-md mx-auto lg:mx-0">
              Discover dishes made for your mood — fresh, comforting, or sweet.
              Seasonal salads, vibrant bowls, and cold-pressed juices made from
              the freshest local produce. Nourish your day with real goodness.
            </p>
            <button
              data-testid="order-food-btn"
              className="px-6 md:px-8 py-3 md:py-3.5 bg-orange-500 hover:bg-orange-600 rounded-full font-semibold text-white shadow-xl shadow-orange-500/30 transition-all inline-flex items-center gap-2 group text-sm md:text-base"
            >
              Order your Food
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* ============ CUISINE CATEGORIES (image #3 bottom) ============ */}
      <section id="about" className="relative py-16 md:py-24 px-4 md:px-6 bg-[#0a0806] text-white overflow-hidden">
        {/* decorative elements */}
        <div className="pointer-events-none absolute -left-40 top-40 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-orange-500/5 rounded-full blur-[100px] md:blur-[140px]" />
        <div className="pointer-events-none absolute -right-32 bottom-20 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-green-500/5 rounded-full blur-[100px] md:blur-[140px]" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <h2
            className="text-responsive-h3 md:text-5xl font-extrabold text-center mb-10 md:mb-16 tracking-tight px-4"
            style={{ fontFamily: "'Fraunces', Georgia, serif" }}
            data-testid="cuisine-title"
          >
            Try Out Our Variety Of <span className="text-orange-500">Cuisine</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {CUISINE_CATEGORIES.map((c) => {
              const Icon = c.icon;
              return (
                <div
                  key={c.name}
                  data-testid={`cuisine-card-${c.name.toLowerCase()}`}
                  className="group bg-white/[0.03] backdrop-blur-md rounded-3xl overflow-hidden border border-white/10 hover:border-orange-500/30 transition-all duration-500 hover:-translate-y-2 shadow-2xl"
                >
                  <div className="relative h-48 md:h-52 overflow-hidden">
                    <img
                      src={c.img}
                      alt={c.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0806] to-transparent opacity-60" />
                    <div className="absolute top-4 left-4 w-9 h-9 md:w-10 md:h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
                      <Icon className="w-4 h-4 md:w-5 md:h-5" />
                    </div>
                  </div>
                  <div className="p-5 md:p-6">
                    <h4 className="font-extrabold text-lg md:text-xl text-white group-hover:text-orange-500 transition-colors">{c.name}</h4>
                    <p className="text-xs md:text-sm text-gray-400 leading-relaxed mt-3">
                      Discover dishes made for your mood — fresh, comforting, or
                      sweet. Seasonal salads, vibrant bowls.
                    </p>
                    <button className="mt-4 md:mt-6 w-full py-2.5 md:py-3 bg-white/5 hover:bg-orange-500 text-white text-xs md:text-sm font-bold rounded-xl transition-all border border-white/5 hover:border-orange-500/50 active:scale-95">
                      Explore
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============ FOOD CARDS WITH PRICE TAGS (image #4) ============ */}
      <section className="relative py-16 md:py-24 px-4 md:px-6 bg-[#0a0806]">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center md:items-end justify-between mb-12 md:mb-16 flex-wrap gap-4 md:gap-6 text-center md:text-left">
            <div className="w-full md:w-auto">
              <p className="text-orange-500 font-black text-[10px] md:text-xs tracking-widest uppercase mb-2 md:mb-3">
                Today's Specials
              </p>
              <h2
                className="text-responsive-h3 md:text-5xl font-extrabold text-white tracking-tight"
                style={{ fontFamily: "'Fraunces', Georgia, serif" }}
                data-testid="specials-title"
              >
                Hot off the <span className="text-orange-500">kitchen</span>
              </h2>
            </div>
            <a
              href="#"
              className="text-xs md:text-sm text-gray-400 hover:text-orange-500 font-bold inline-flex items-center gap-2 transition-colors group mx-auto md:mx-0"
            >
              View all <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-16 md:gap-12 pt-8 md:pt-12">
            {cards.map((card, idx) => (
              <div
                key={card.id}
                data-testid={`special-card-${idx}`}
                className="group relative bg-white/[0.03] backdrop-blur-md rounded-3xl pt-24 md:pt-28 pb-6 md:pb-8 px-5 md:px-6 border border-white/10 hover:border-orange-500/30 transition-all duration-500 hover:-translate-y-2 shadow-2xl"
              >
                <div className="absolute -top-10 md:-top-12 left-1/2 -translate-x-1/2 w-40 h-40 md:w-44 md:h-44">
                  {/* Image */}
                  <div className="w-full h-full rounded-full overflow-hidden border-4 md:border-8 border-[#0a0806] shadow-2xl group-hover:scale-105 transition-transform duration-500">
                    <img
                      src={card.thumb}
                      alt={card.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {/* Price Tag */}
                  <div className="absolute top-6 md:top-8 -right-2 md:-right-4 bg-orange-500 text-white font-black text-base md:text-lg px-3 md:px-4 py-1 md:py-1.5 rounded-xl md:rounded-2xl shadow-xl shadow-orange-500/20 rotate-12 group-hover:rotate-0 transition-all duration-500">
                    ₹{card.price}
                  </div>
                </div>
                <div className="text-center mt-8 md:mt-12">
                  <h4 className="font-extrabold text-white text-base md:text-lg truncate group-hover:text-orange-500 transition-colors">
                    {card.name}
                  </h4>
                  <p className="text-[10px] md:text-xs text-gray-500 mt-2 font-medium uppercase tracking-wider">{card.category}</p>
                  
                  <div className="mt-5 md:mt-6 flex items-center justify-between">
                    <div className="flex items-center gap-1 md:gap-1.5 bg-orange-500/10 px-2.5 md:px-3 py-1 rounded-full text-orange-500 text-[10px] md:text-xs">
                      <Star className="w-3 h-3 fill-current" />
                      <span className="font-black">{card.rating}</span>
                    </div>
                    <button
                      data-testid={`add-to-cart-${idx}`}
                      className="w-10 h-10 md:w-11 md:h-11 rounded-xl md:rounded-2xl bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center transition-all shadow-lg shadow-orange-500/20 active:scale-90 group/btn"
                    >
                      <ShoppingBag className="w-4 h-4 md:w-5 md:h-5 group-hover/btn:scale-110 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer
        id="contact"
        className="border-t border-white/5 py-12 md:py-16 px-4 md:px-6 bg-[#070504]"
      >
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 md:gap-12">
          <div className="space-y-5 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start space-x-2">
              <div className="w-9 h-9 bg-orange-500 rounded-lg flex items-center justify-center">
                <Utensils className="text-white w-5 h-5" />
              </div>
              <span className="text-xl font-extrabold tracking-tight">
                <span className="text-orange-500">Nex</span>Serv
              </span>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed max-w-xs mx-auto sm:mx-0">
              Premium food delivery providing high-quality meals from top
              restaurants to your door.
            </p>
            <div className="flex justify-center sm:justify-start gap-4 text-gray-500">
              <Facebook className="w-5 h-5 hover:text-orange-500 cursor-pointer" />
              <Twitter className="w-5 h-5 hover:text-orange-500 cursor-pointer" />
              <Instagram className="w-5 h-5 hover:text-orange-500 cursor-pointer" />
            </div>
          </div>
          <div className="text-center sm:text-left">
            <h5 className="font-bold mb-5 text-xs md:text-sm uppercase tracking-wider text-orange-500">
              Quick Links
            </h5>
            <ul className="space-y-3 text-sm text-gray-500">
              <li><a href="#menu" className="hover:text-white">Browse Menu</a></li>
              <li><a href="#" className="hover:text-white">Active Orders</a></li>
              <li><a href="#" className="hover:text-white">Account Settings</a></li>
              <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
            </ul>
          </div>
          <div className="text-center sm:text-left">
            <h5 className="font-bold mb-5 text-xs md:text-sm uppercase tracking-wider text-orange-500">
              Support
            </h5>
            <ul className="space-y-3 text-sm text-gray-500">
              <li><a href="#" className="hover:text-white">Help Center</a></li>
              <li><a href="#" className="hover:text-white">Contact Us</a></li>
              <li><a href="#" className="hover:text-white">Partner with Us</a></li>
              <li><a href="#" className="hover:text-white">Terms of Service</a></li>
            </ul>
          </div>
          <div className="text-center sm:text-left">
            <h5 className="font-bold mb-5 text-xs md:text-sm uppercase tracking-wider text-orange-500">
              Newsletter
            </h5>
            <p className="text-sm text-gray-500 mb-4 max-w-xs mx-auto sm:mx-0">
              Get the latest offers and updates.
            </p>
            <div className="flex gap-2 max-w-xs mx-auto sm:mx-0">
              <input
                type="email"
                placeholder="Email"
                data-testid="newsletter-input"
                className="bg-white/5 border border-white/10 rounded-full px-4 py-2 text-sm w-full outline-none focus:border-orange-500/50"
              />
              <button
                data-testid="newsletter-btn"
                className="p-2 bg-orange-500 rounded-full hover:bg-orange-600 transition-colors shrink-0"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-white/5 text-center text-xs text-gray-600">
          © 2026 NexServ. All rights reserved.
        </div>
      </footer>

      <style>{`
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0) }
          50% { transform: translateY(-18px) }
        }
        @keyframes bounceSlow {
          0%, 100% { transform: translateY(0) rotate(0deg) }
          50% { transform: translateY(-12px) rotate(8deg) }
        }
        .animate-float-slow { animation: floatSlow 6s ease-in-out infinite; }
        .animate-bounce-slow { animation: bounceSlow 4.5s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default LandingPage;
