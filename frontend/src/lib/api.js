import LZString from 'lz-string';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

const compress = (data) => {
  return LZString.compressToUTF16(JSON.stringify(data));
};

const decompress = (compressed) => {
  if (!compressed) return null;
  try {
    const decompressed = LZString.decompressFromUTF16(compressed);
    return decompressed ? JSON.parse(decompressed) : null;
  } catch (e) {
    // If it's not compressed, try parsing as JSON
    try {
      return JSON.parse(compressed);
    } catch (e2) {
      return null;
    }
  }
};

export const api = {
  auth: {
    login: async (credentials) => {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Login failed' }));
        throw new Error(errorData.error || 'Login failed');
      }
      return res.json();
    },
    register: async (data) => {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Registration failed' }));
        throw new Error(errorData.error || 'Registration failed');
      }
      return res.json();
    },
    me: async () => {
      const res = await fetch(`${API_URL}/auth/me`, {
        headers: getHeaders()
      });
      if (!res.ok) throw new Error('Unauthorized');
      return res.json();
    }
  },
  resumes: {
    list: async () => {
      const guestUser = localStorage.getItem('guestUser');
      if (guestUser) {
        const resumes = localStorage.getItem('guest_resumes');
        if (!resumes) return [];
        const decompressed = decompress(resumes);
        return Array.isArray(decompressed) ? decompressed : [];
      }
      const res = await fetch(`${API_URL}/resumes`, {
        headers: getHeaders()
      });
      if (!res.ok) return [];
      return res.json();
    },
    get: async (id) => {
      const guestUser = localStorage.getItem('guestUser');
      if (guestUser) {
        const resumesStr = localStorage.getItem('guest_resumes');
        const resumes = resumesStr ? decompress(resumesStr) : [];
        return resumes.find((r) => r._id === id);
      }
      const res = await fetch(`${API_URL}/resumes/${id}`, {
        headers: getHeaders()
      });
      return res.json();
    },
    create: async (data) => {
      const guestUser = localStorage.getItem('guestUser');
      if (guestUser) {
        const resumesStr = localStorage.getItem('guest_resumes');
        const resumes = resumesStr ? decompress(resumesStr) : [];
        const newResume = { ...data, _id: 'guest_' + Date.now(), lastUpdated: new Date().toISOString() };
        resumes.push(newResume);
        localStorage.setItem('guest_resumes', compress(resumes));
        return newResume;
      }
      const res = await fetch(`${API_URL}/resumes`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
      });
      return res.json();
    },
    update: async (id, data) => {
      const guestUser = localStorage.getItem('guestUser');
      if (guestUser) {
        const resumesStr = localStorage.getItem('guest_resumes');
        const resumes = resumesStr ? decompress(resumesStr) : [];
        const index = resumes.findIndex((r) => r._id === id);
        if (index !== -1) {
          resumes[index] = { ...data, _id: id, lastUpdated: new Date().toISOString() };
          localStorage.setItem('guest_resumes', compress(resumes));
        }
        return resumes[index];
      }
      const res = await fetch(`${API_URL}/resumes/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data)
      });
      return res.json();
    },
    delete: async (id) => {
      const guestUser = localStorage.getItem('guestUser');
      if (guestUser) {
        const resumesStr = localStorage.getItem('guest_resumes');
        const resumes = resumesStr ? decompress(resumesStr) : [];
        const filtered = resumes.filter((r) => r._id !== id);
        localStorage.setItem('guest_resumes', compress(filtered));
        return { success: true };
      }
      const res = await fetch(`${API_URL}/resumes/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      return res.json();
    },
    uploadImage: async (id, file) => {
      const guestUser = localStorage.getItem('guestUser');
      if (guestUser) {
        // For guest users, we still use base64 in localStorage
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const resumesStr = localStorage.getItem('guest_resumes');
            const resumes = resumesStr ? decompress(resumesStr) : [];
            const index = resumes.findIndex((r) => r._id === id);
            if (index !== -1) {
              resumes[index].previewImage = reader.result;
              localStorage.setItem('guest_resumes', compress(resumes));
            }
            resolve(resumes[index]);
          };
          reader.readAsDataURL(file);
        });
      }

      const formData = new FormData();
      formData.append('image', file);

      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/resumes/${id}/upload`, {
        method: 'POST',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: formData
      });
      return res.json();
    }
  },
  coverLetters: {
    list: async () => {
      const guestUser = localStorage.getItem('guestUser');
      if (guestUser) {
        const letters = localStorage.getItem('guest_letters');
        if (!letters) return [];
        const decompressed = decompress(letters);
        return Array.isArray(decompressed) ? decompressed : [];
      }
      const res = await fetch(`${API_URL}/cover-letters`, {
        headers: getHeaders()
      });
      if (!res.ok) return [];
      return res.json();
    },
    get: async (id) => {
      const guestUser = localStorage.getItem('guestUser');
      if (guestUser) {
        const lettersStr = localStorage.getItem('guest_letters');
        const letters = lettersStr ? decompress(lettersStr) : [];
        return letters.find((l) => l._id === id);
      }
      const res = await fetch(`${API_URL}/cover-letters/${id}`, {
        headers: getHeaders()
      });
      return res.json();
    },
    create: async (data) => {
      const guestUser = localStorage.getItem('guestUser');
      if (guestUser) {
        const lettersStr = localStorage.getItem('guest_letters');
        const letters = lettersStr ? decompress(lettersStr) : [];
        const newLetter = { ...data, _id: 'guest_' + Date.now(), lastUpdated: new Date().toISOString() };
        letters.push(newLetter);
        localStorage.setItem('guest_letters', compress(letters));
        return newLetter;
      }
      const res = await fetch(`${API_URL}/cover-letters`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
      });
      return res.json();
    },
    update: async (id, data) => {
      const guestUser = localStorage.getItem('guestUser');
      if (guestUser) {
        const lettersStr = localStorage.getItem('guest_letters');
        const letters = lettersStr ? decompress(lettersStr) : [];
        const index = letters.findIndex((l) => l._id === id);
        if (index !== -1) {
          letters[index] = { ...data, _id: id, lastUpdated: new Date().toISOString() };
          localStorage.setItem('guest_letters', compress(letters));
        }
        return letters[index];
      }
      const res = await fetch(`${API_URL}/cover-letters/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data)
      });
      return res.json();
    },
    delete: async (id) => {
      const guestUser = localStorage.getItem('guestUser');
      if (guestUser) {
        const lettersStr = localStorage.getItem('guest_letters');
        const letters = lettersStr ? decompress(lettersStr) : [];
        const filtered = letters.filter((l) => l._id !== id);
        localStorage.setItem('guest_letters', compress(filtered));
        return { success: true };
      }
      const res = await fetch(`${API_URL}/cover-letters/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      return res.json();
    }
  }
};
