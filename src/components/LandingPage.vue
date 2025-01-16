<template>
  <div class="dark-theme">
    <HeaderComponent />
    <main class="landing-page">
      <div class="content-container">
        <div class="hero-section">
          <h1 class="main-title">
            Este es tu momento.<br />
            <span class="highlight">Vamos a organizar</span> tus recordatorios
          </h1>
          <p class="subtitle">
            El año pasado es la prueba de que podemos redefinir la forma en la que trabajamos. ¿Qué
            te parece si creamos un futuro más flexible, inclusivo y conectado?
          </p>
          <p class="cta-text">¿Necesitas crear un recordatorio?</p>
          <router-link to="/login" class="cta-button">
            Empieza ahora
            <span class="button-arrow">→</span>
          </router-link>
        </div>
      </div>
    </main>
    <FooterComponent />
  </div>
</template>

<script>
import HeaderComponent from './HeaderComponent.vue'
import FooterComponent from './FooterComponent.vue'

export default {
  components: {
    HeaderComponent,
    FooterComponent,
  },
  name: 'LandingPage',
}
</script>

<style>
:root {
  --primary-color: #6366f1;
  --primary-hover: #818cf8;
  --text-primary: #f8fafc;
  --text-secondary: #94a3b8;
  --bg-dark: #0f172a;
  --bg-darker: #020617;
  --accent-gradient: linear-gradient(135deg, #6366f1 0%, #818cf8 100%);
}

.dark-theme {
  background-color: var(--bg-dark);
  min-height: 100vh;
  color: var(--text-primary);
}

.landing-page {
  position: relative;
  min-height: calc(100% - 140px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: radial-gradient(circle at center, var(--bg-dark) 0%, var(--bg-darker) 100%);
}

.content-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.hero-section {
  text-align: center;
  max-width: 800px;
  margin: 0 auto;
}

.main-title {
  font-size: 4rem;
  font-weight: 800;
  line-height: 1.2;
  margin-bottom: 2rem;
  background: var(--accent-gradient);
  background-clip: text;
  color: transparent;
  animation: titleFade 0.8s ease-in;
}

.highlight {
  position: relative;
  display: inline-block;
  color: var(--primary-hover);
}

.highlight::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 100%;
  height: 2px;
  background: var(--accent-gradient);
  transform: scaleX(0);
  transform-origin: right;
  transition: transform 0.3s ease;
}

.highlight:hover::after {
  transform: scaleX(1);
  transform-origin: left;
}

.subtitle {
  font-size: 1.25rem;
  line-height: 1.8;
  color: var(--text-secondary);
  margin-bottom: 2rem;
  animation: fadeIn 1s ease-in 0.3s both;
}

.cta-text {
  font-size: 1.5rem;
  color: var(--text-primary);
  margin-bottom: 2rem;
  animation: fadeIn 1s ease-in 0.6s both;
}

.cta-button {
  display: inline-flex;
  align-items: center;
  background: var(--accent-gradient);
  color: white;
  padding: 1rem 2rem;
  border-radius: 50px;
  font-size: 1.125rem;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
  animation: fadeIn 1s ease-in 0.9s both;
}

.cta-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
}

.button-arrow {
  margin-left: 0.5rem;
  transition: transform 0.3s ease;
}

.cta-button:hover .button-arrow {
  transform: translateX(4px);
}

@keyframes titleFade {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  0% {
    opacity: 0;
    transform: translateY(10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .main-title {
    font-size: 2.5rem;
  }

  .subtitle {
    font-size: 1.125rem;
  }

  .cta-text {
    font-size: 1.25rem;
  }

  .content-container {
    padding: 1rem;
  }
}
</style>
