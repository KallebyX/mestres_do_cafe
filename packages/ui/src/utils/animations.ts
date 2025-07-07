/**
 * Utilitários para animações e transições
 */

export const ANIMATION_DURATION = {
  fast: 150,
  normal: 300,
  slow: 500
} as const;

export const EASING = {
  linear: 'linear',
  ease: 'ease',
  easeIn: 'ease-in',
  easeOut: 'ease-out',
  easeInOut: 'ease-in-out',
  spring: 'cubic-bezier(0.4, 0, 0.2, 1)'
} as const;

export const ANIMATION_DELAYS = {
  none: 0,
  short: 100,
  medium: 200,
  long: 400
} as const;

/**
 * Verifica se o usuário prefere movimento reduzido
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Aplica animação respeitando preferências do usuário
 */
export function applyAnimation(
  element: HTMLElement,
  animation: string,
  duration: number = ANIMATION_DURATION.normal
): void {
  if (prefersReducedMotion()) {
    return;
  }
  
  element.style.animation = `${animation} ${duration}ms ${EASING.spring}`;
}

/**
 * Utilitário para criar transições CSS
 */
export function createTransition(
  properties: string[] = ['all'],
  duration: number = ANIMATION_DURATION.normal,
  easing: string = EASING.spring
): string {
  return properties
    .map(prop => `${prop} ${duration}ms ${easing}`)
    .join(', ');
}

/**
 * Animações predefinidas
 */
export const ANIMATIONS = {
  fadeIn: 'coffee-fade-in',
  slideInRight: 'coffee-slide-in-right',
  scaleIn: 'coffee-scale-in',
  float: 'coffee-float',
  shimmer: 'coffee-shimmer'
} as const;

/**
 * Efeitos de hover
 */
export const HOVER_EFFECTS = {
  lift: 'coffee-hover-lift',
  scale: 'coffee-hover-scale',
  glow: 'coffee-hover-glow'
} as const;

/**
 * Aplica efeito de hover
 */
export function applyHoverEffect(
  element: HTMLElement,
  effect: keyof typeof HOVER_EFFECTS
): void {
  element.classList.add(HOVER_EFFECTS[effect]);
}

/**
 * Remove efeito de hover
 */
export function removeHoverEffect(
  element: HTMLElement,
  effect: keyof typeof HOVER_EFFECTS
): void {
  element.classList.remove(HOVER_EFFECTS[effect]);
}

/**
 * Observador de interseção para animações
 */
export function createIntersectionObserver(
  callback: (entries: IntersectionObserverEntry[]) => void,
  options: IntersectionObserverInit = {}
): IntersectionObserver | null {
  if (typeof window === 'undefined') return null;
  
  const defaultOptions: IntersectionObserverInit = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1,
    ...options
  };
  
  return new IntersectionObserver(callback, defaultOptions);
}

/**
 * Anima elementos quando entram na viewport
 */
export function animateOnScroll(
  selector: string,
  animation: string = ANIMATIONS.fadeIn,
  options: IntersectionObserverInit = {}
): void {
  if (typeof window === 'undefined') return;
  
  const elements = document.querySelectorAll(selector);
  
  const observer = createIntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const element = entry.target as HTMLElement;
        element.classList.add(animation);
        observer?.unobserve(element);
      }
    });
  }, options);
  
  if (observer) {
    elements.forEach((element) => observer.observe(element));
  }
}

/**
 * Stagger animation para múltiplos elementos
 */
export function staggerAnimation(
  elements: HTMLElement[],
  animation: string = ANIMATIONS.fadeIn,
  delay: number = ANIMATION_DELAYS.short
): void {
  if (prefersReducedMotion()) {
    elements.forEach(el => el.classList.add(animation));
    return;
  }
  
  elements.forEach((element, index) => {
    setTimeout(() => {
      element.classList.add(animation);
    }, index * delay);
  });
}

/**
 * Pulsa um elemento para chamar atenção
 */
export function pulseElement(
  element: HTMLElement,
  duration: number = 1000,
  intensity: number = 1.05
): void {
  if (prefersReducedMotion()) return;
  
  const keyframes = [
    { transform: 'scale(1)' },
    { transform: `scale(${intensity})` },
    { transform: 'scale(1)' }
  ];
  
  const options = {
    duration,
    easing: EASING.easeInOut,
    iterations: 1
  };
  
  element.animate(keyframes, options);
}

/**
 * Shake animation para feedback de erro
 */
export function shakeElement(
  element: HTMLElement,
  duration: number = 500,
  intensity: number = 10
): void {
  if (prefersReducedMotion()) return;
  
  const keyframes = [
    { transform: 'translateX(0)' },
    { transform: `translateX(-${intensity}px)` },
    { transform: `translateX(${intensity}px)` },
    { transform: `translateX(-${intensity}px)` },
    { transform: `translateX(${intensity}px)` },
    { transform: 'translateX(0)' }
  ];
  
  const options = {
    duration,
    easing: EASING.easeInOut,
    iterations: 1
  };
  
  element.animate(keyframes, options);
}

/**
 * Slide in animation
 */
export function slideIn(
  element: HTMLElement,
  direction: 'left' | 'right' | 'up' | 'down' = 'right',
  duration: number = ANIMATION_DURATION.normal,
  distance: number = 100
): void {
  if (prefersReducedMotion()) {
    element.style.opacity = '1';
    return;
  }
  
  const translations = {
    left: [`translateX(-${distance}px)`, 'translateX(0)'],
    right: [`translateX(${distance}px)`, 'translateX(0)'],
    up: [`translateY(-${distance}px)`, 'translateY(0)'],
    down: [`translateY(${distance}px)`, 'translateY(0)']
  };
  
  const keyframes = [
    { 
      opacity: '0', 
      transform: translations[direction][0] 
    },
    { 
      opacity: '1', 
      transform: translations[direction][1] 
    }
  ];
  
  const options = {
    duration,
    easing: EASING.spring,
    fill: 'forwards' as FillMode
  };
  
  element.animate(keyframes, options);
}

/**
 * Fade animation
 */
export function fade(
  element: HTMLElement,
  type: 'in' | 'out' = 'in',
  duration: number = ANIMATION_DURATION.normal
): Promise<void> {
  if (prefersReducedMotion()) {
    element.style.opacity = type === 'in' ? '1' : '0';
    return Promise.resolve();
  }
  
  const keyframes = type === 'in' 
    ? [{ opacity: '0' }, { opacity: '1' }]
    : [{ opacity: '1' }, { opacity: '0' }];
  
  const options = {
    duration,
    easing: EASING.easeInOut,
    fill: 'forwards' as FillMode
  };
  
  return element.animate(keyframes, options).finished.then(() => {});
}

/**
 * Scale animation
 */
export function scale(
  element: HTMLElement,
  from: number = 0.95,
  to: number = 1,
  duration: number = ANIMATION_DURATION.normal
): void {
  if (prefersReducedMotion()) {
    element.style.transform = `scale(${to})`;
    return;
  }
  
  const keyframes = [
    { 
      opacity: '0',
      transform: `scale(${from})` 
    },
    { 
      opacity: '1',
      transform: `scale(${to})` 
    }
  ];
  
  const options = {
    duration,
    easing: EASING.spring,
    fill: 'forwards' as FillMode
  };
  
  element.animate(keyframes, options);
}

/**
 * Bounce animation
 */
export function bounce(
  element: HTMLElement,
  duration: number = 600,
  height: number = 20
): void {
  if (prefersReducedMotion()) return;
  
  const keyframes = [
    { transform: 'translateY(0)' },
    { transform: `translateY(-${height}px)` },
    { transform: 'translateY(0)' },
    { transform: `translateY(-${height/2}px)` },
    { transform: 'translateY(0)' }
  ];
  
  const options = {
    duration,
    easing: EASING.easeOut,
    iterations: 1
  };
  
  element.animate(keyframes, options);
}

/**
 * Utilitário para animações sequenciais
 */
export class AnimationSequence {
  private animations: Array<() => Promise<void>> = [];
  
  add(animationFn: () => Promise<void>): this {
    this.animations.push(animationFn);
    return this;
  }
  
  addDelay(ms: number): this {
    this.animations.push(() => new Promise(resolve => setTimeout(resolve, ms)));
    return this;
  }
  
  async play(): Promise<void> {
    for (const animation of this.animations) {
      await animation();
    }
  }
  
  async playParallel(): Promise<void> {
    await Promise.all(this.animations.map(animation => animation()));
  }
  
  clear(): this {
    this.animations = [];
    return this;
  }
}

/**
 * Wrapper para animações com cleanup automático
 */
export function withAnimation<T extends HTMLElement>(
  element: T,
  animationFn: (el: T) => void
): T {
  const originalTransition = element.style.transition;
  
  try {
    animationFn(element);
  } finally {
    // Restore original transition after animation
    setTimeout(() => {
      element.style.transition = originalTransition;
    }, 50);
  }
  
  return element;
}