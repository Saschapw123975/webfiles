document.addEventListener('DOMContentLoaded', () => {
  
  // Force dark theme always
  document.documentElement.classList.add('dark-theme');
  document.documentElement.setAttribute('data-theme', 'dark');
  localStorage.setItem('crymson_theme', 'dark');
  
  
  const activityTrackingEnabled = localStorage.getItem('crymson_activity_tracking') !== 'false';
  
  const shell = document.querySelector('.shell');
  if (!shell) return;


  
  const activityTracker = {
    activities: [],
    
    addActivity(type, title, details = '') {
      if (!activityTrackingEnabled) return;
      
      const activity = {
        id: Date.now(),
        type,
        title,
        details,
        timestamp: new Date().toISOString(),
        timeAgo: 'Just now'
      };
      
      this.activities.unshift(activity);
      this.saveActivities();
    },
    
    saveActivities() {
      try {
        localStorage.setItem('crymson_activities', JSON.stringify(this.activities));
      } catch (e) {
        console.warn('Could not save activities');
      }
    },
    
    loadActivities() {
      try {
        const saved = localStorage.getItem('crymson_activities');
        if (saved) {
          this.activities = JSON.parse(saved);
        }
      } catch (e) {
        console.warn('Could not load activities');
      }
    }
  };

  
  if (activityTrackingEnabled) {
    activityTracker.loadActivities();
  }

  
  document.addEventListener('click', (e) => {
    const button = e.target.closest('button, .btn-primary, .nav-item, .activity-item');
    if (button) {
      const buttonText = button.textContent.trim() || button.getAttribute('aria-label') || 'Unknown button';
      const page = window.location.pathname.split('/').pop() || 'unknown';
      
      
      if (!button.classList.contains('primary')) {
        activityTracker.addActivity('click', `Button clicked: ${buttonText}`, `Page: ${page}`);
      }
    }
  });

  
  const originalLocationAssign = window.location.assign;
  window.location.assign = function(url) {
    const page = url.split('/').pop() || 'unknown';
    activityTracker.addActivity('navigation', `Navigated to ${page}`, 'Page change');
    return originalLocationAssign.call(this, url);
  };

  
  window.handleLoginSuccess = async (username) => {
    
    if (window.crymsonAnimations) {
      window.crymsonAnimations.showLoadingSpinner();
    }
    
    
    const welcomeDiv = document.createElement('div');
    welcomeDiv.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: linear-gradient(145deg, #3d73ff, #6dd8ff);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 48px;
      font-weight: 700;
      z-index: 10000;
      opacity: 0;
      transform: scale(0.8);
      transition: all 0.6s ease;
    `;
    welcomeDiv.innerHTML = `Welcome, ${username}!`;
    document.body.appendChild(welcomeDiv);
    
    
    if (window.crymsonAnimations) {
      window.crymsonAnimations.hideLoadingSpinner();
    }
    
    
    requestAnimationFrame(() => {
      welcomeDiv.style.opacity = '1';
      welcomeDiv.style.transform = 'scale(1)';
    });
    
    
    setTimeout(async () => {
      welcomeDiv.style.opacity = '0';
      welcomeDiv.style.transform = 'scale(0.9)';
      setTimeout(() => {
        if (document.body.contains(welcomeDiv)) {
          document.body.removeChild(welcomeDiv);
        }
        
        if (window.crymsonAnimations) {
          window.crymsonAnimations.pageTransition('forward').then(() => {
            window.location.href = 'welcome.html';
          });
        } else {
          window.location.href = 'welcome.html';
        }
      }, 500);
    }, 2000);
  };

  
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) {
    shell.classList.remove('fx-start');
    return;
  }

  
  shell.classList.add('fx-start');

  
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      shell.classList.remove('fx-start');
    });
  });

  
  const primaryBtn = document.querySelector('.primary');
  const userField = document.querySelector('#user');
  const passField = document.querySelector('#pass');
  const rememberCheckbox = document.querySelector('#remember-me');

  function postJsonMessage(payload) {
    try {
      if (window.chrome && window.chrome.webview) {
        window.chrome.webview.postMessage(JSON.stringify(payload));
      }
    } catch (e) {
      console.log('postMessage failed', e);
    }
  }

  if (primaryBtn && userField && passField) {
    primaryBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const user = userField.value.trim();
      const pass = passField.value;
      if (user && pass) {
        
        if (window.crymsonAnimations) {
          window.crymsonAnimations.showLoadingSpinner();
        }

        const rememberMe = rememberCheckbox ? rememberCheckbox.checked : false;
        
        // Save credentials if remember me is checked
        if (rememberMe) {
          localStorage.setItem('crymson_saved_username', user);
          localStorage.setItem('crymson_saved_password', pass);
          localStorage.setItem('crymson_remember_me', 'true');
        } else {
          // Clear saved credentials if unchecked
          localStorage.removeItem('crymson_saved_username');
          localStorage.removeItem('crymson_saved_password');
          localStorage.removeItem('crymson_remember_me');
        }
        
        postJsonMessage({ type: 'LOGIN', username: user, password: pass, rememberMe });
      } else {
        
        if (window.crymsonAnimations) {
          userField.style.animation = 'shake 0.5s ease';
          passField.style.animation = 'shake 0.5s ease';
          setTimeout(() => {
            userField.style.animation = '';
            passField.style.animation = '';
          }, 500);
        }
        alert('Please enter username and password');
      }
    });

    
    userField.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') primaryBtn.click();
    });
    passField.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') primaryBtn.click();
    });
  }
});
