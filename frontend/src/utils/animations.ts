import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const animatePageTransition = (element: HTMLElement) => {
  gsap.fromTo(
    element,
    { opacity: 0, y: 10 },
    { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }
  );
};

export const animateCards = (selector: string) => {
  gsap.fromTo(
    selector,
    { opacity: 0, y: 20 },
    {
      opacity: 1,
      y: 0,
      duration: 0.5,
      stagger: 0.1,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: selector,
        start: 'top 80%',
      },
    }
  );
};

export const animateCounter = (element: HTMLElement, endValue: number) => {
  const obj = { value: 0 };
  gsap.to(obj, {
    value: endValue,
    duration: 1.5,
    ease: 'power2.out',
    onUpdate: () => {
      element.textContent = Math.round(obj.value).toString();
    },
  });
};

export const animateProgressBar = (element: HTMLElement, percentage: number) => {
  gsap.to(element, {
    width: `${percentage}%`,
    duration: 1,
    ease: 'power2.out',
  });
};

export const pulseGlow = (element: HTMLElement) => {
  gsap.to(element, {
    boxShadow: '0 0 40px hsla(158, 64%, 52%, 0.6)',
    duration: 1,
    yoyo: true,
    repeat: 5,
    ease: 'sine.inOut',
  });
};
