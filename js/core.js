/* =====================================================
   REDMARK STUDIO - Core Dashboard
   Hidden developer vault with keyboard sequence unlock
   ===================================================== */

class CoreDashboard {
    constructor() {
        this.isUnlocked = false;
        this.isVisible = false;
        this.sequence = '';
        this.targetSequence = 'REDMARK';
        this.sequenceTimeout = null;
        this.unlockTimeout = null;
        this.coreElement = null;
        this.unlockElement = null;
        this.notes = this.loadNotes();
        this.currentNoteId = null;
        this.notesLoaded = false;
        
        this.init();
    }
    
    init() {
        this.coreElement = document.getElementById('core-dashboard');
        this.unlockElement = document.getElementById('core-unlock');
        
        this.setupKeyboardSequence();
        this.setupCoreNavigation();
        this.setupNotes();
        this.startClock();
    }
    
    setupKeyboardSequence() {
        document.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return;
            }
            
            const key = e.key.toUpperCase();
            
            if (/[A-Z]/.test(key)) {
                this.addToSequence(key);
            } else if (e.key === 'Escape') {
                this.lock();
            }
        });
    }
    
    addToSequence(key) {
        this.sequence += key;
        
        if (this.sequence.length > this.targetSequence.length) {
            this.sequence = this.sequence.slice(-this.targetSequence.length);
        }
        
        if (this.sequence.endsWith(this.targetSequence)) {
            this.unlock();
        }
        
        if (this.sequenceTimeout) {
            clearTimeout(this.sequenceTimeout);
        }
        
        this.sequenceTimeout = setTimeout(() => {
            this.sequence = '';
        }, 2000);
    }
    
    unlock() {
        if (this.isUnlocked) return;
        
        this.isUnlocked = true;
        sessionStorage.setItem('coreUnlocked', 'true');
        sessionStorage.setItem('coreUnlockTime', Date.now().toString());
        
        this.triggerUnlockAnimation();
    }
    
    triggerUnlockAnimation() {
        this.unlockElement.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        this.unlockTimeout = setTimeout(() => {
            this.unlockElement.classList.remove('active');
            this.show();
            document.body.style.overflow = '';
        }, 2000);
    }
    
    show() {
        if (!this.isUnlocked) return;
        
        this.isVisible = true;
        this.coreElement.classList.remove('hidden');
        this.coreElement.classList.add('active');
        
        if (!this.notesLoaded) {
            this.renderNotesList();
            this.notesLoaded = true;
        }
    }
    
    lock() {
        this.isUnlocked = false;
        this.isVisible = false;
        
        sessionStorage.removeItem('coreUnlocked');
        sessionStorage.removeItem('coreUnlockTime');
        
        this.coreElement.classList.remove('active');
        this.coreElement.classList.add('hidden');
        
        this.sequence = '';
        
        if (this.unlockTimeout) {
            clearTimeout(this.unlockTimeout);
        }
    }
    
    setupCoreNavigation() {
        const navBtns = document.querySelectorAll('.core-nav-btn');
        const views = document.querySelectorAll('.core-view');
        
        navBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                navBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                const targetView = btn.dataset.core;
                views.forEach(view => {
                    view.classList.remove('active');
                    if (view.id === `core-${targetView}-view`) {
                        view.classList.add('active');
                    }
                });
            });
        });
    }
    
    setupNotes() {
        const noteTags = document.querySelectorAll('.note-tag');
        noteTags.forEach(tag => {
            tag.addEventListener('click', () => {
                noteTags.forEach(t => t.classList.remove('active'));
                tag.classList.add('active');
            });
        });
        
        this.checkAutoUnlock();
    }
    
    checkAutoUnlock() {
        const unlockTime = sessionStorage.getItem('coreUnlockTime');
        if (unlockTime) {
            const elapsed = Date.now() - parseInt(unlockTime);
            if (elapsed < 30 * 60 * 1000) {
                this.isUnlocked = true;
                this.show();
            } else {
                sessionStorage.removeItem('coreUnlocked');
                sessionStorage.removeItem('coreUnlockTime');
            }
        }
    }
    
    loadNotes() {
        const saved = localStorage.getItem('redmarkNotes');
        if (saved) {
            return JSON.parse(saved);
        }
        return [
            {
                id: 'note-1',
                title: 'Welcome to Core',
                content: 'This is your developer vault. All notes are stored locally in your browser.',
                tags: ['important'],
                date: new Date().toISOString()
            },
            {
                id: 'note-2',
                title: 'Development Roadmap',
                content: '- Q1: Complete Neon Runner v2.0\n- Q2: Launch Cyber Duel multiplayer\n- Q3: New game announcement',
                tags: ['feature'],
                date: new Date().toISOString()
            }
        ];
    }
    
    saveNotes() {
        localStorage.setItem('redmarkNotes', JSON.stringify(this.notes));
    }
    
    renderNotesList() {
        const notesList = document.getElementById('notesList');
        if (!notesList) return;
        
        notesList.innerHTML = this.notes.map(note => `
            <div class="notes-list-item ${note.id === this.currentNoteId ? 'active' : ''}" 
                 data-note-id="${note.id}" 
                 onclick="loadNote('${note.id}')">
                <div class="notes-list-title">${note.title}</div>
                <div class="notes-list-preview">${note.content.substring(0, 50)}...</div>
                <div class="notes-list-date">${this.formatDate(note.date)}</div>
            </div>
        `).join('');
    }
    
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    createNewNote() {
        const newNote = {
            id: 'note-' + Date.now(),
            title: 'New Note',
            content: '',
            tags: [],
            date: new Date().toISOString()
        };
        
        this.notes.unshift(newNote);
        this.currentNoteId = newNote.id;
        this.saveNotes();
        this.renderNotesList();
        this.loadNote(newNote.id);
    }
    
    loadNote(noteId) {
        const note = this.notes.find(n => n.id === noteId);
        if (!note) return;
        
        this.currentNoteId = noteId;
        
        const titleInput = document.getElementById('noteTitle');
        const contentArea = document.getElementById('noteContent');
        
        if (titleInput) titleInput.value = note.title;
        if (contentArea) contentArea.value = note.content;
        
        const listItems = document.querySelectorAll('.notes-list-item');
        listItems.forEach(item => {
            item.classList.remove('active');
            if (item.dataset.noteId === noteId) {
                item.classList.add('active');
            }
        });
    }
    
    saveCurrentNote() {
        if (!this.currentNoteId) return;
        
        const note = this.notes.find(n => n.id === this.currentNoteId);
        if (!note) return;
        
        const titleInput = document.getElementById('noteTitle');
        const contentArea = document.getElementById('noteContent');
        
        if (titleInput) note.title = titleInput.value;
        if (contentArea) note.content = contentArea.value;
        
        note.date = new Date().toISOString();
        this.saveNotes();
        this.renderNotesList();
    }
    
    deleteCurrentNote() {
        if (!this.currentNoteId) return;
        
        const confirmDelete = confirm('Are you sure you want to delete this note?');
        if (!confirmDelete) return;
        
        this.notes = this.notes.filter(n => n.id !== this.currentNoteId);
        this.saveNotes();
        
        if (this.notes.length > 0) {
            this.loadNote(this.notes[0].id);
        } else {
            this.clearNoteForm();
        }
        
        this.renderNotesList();
    }
    
    clearNoteForm() {
        const titleInput = document.getElementById('noteTitle');
        const contentArea = document.getElementById('noteContent');
        
        if (titleInput) titleInput.value = '';
        if (contentArea) contentArea.value = '';
        
        this.currentNoteId = null;
    }
    
    startClock() {
        const updateClock = () => {
            const timeDisplay = document.getElementById('coreTime');
            if (timeDisplay && this.isVisible) {
                const now = new Date();
                const timeString = now.toLocaleTimeString('en-US', {
                    hour12: false,
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                });
                timeDisplay.textContent = timeString;
            }
        };
        
        updateClock();
        setInterval(updateClock, 1000);
    }
}

window.CoreDashboard = CoreDashboard;
