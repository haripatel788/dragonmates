// Sample user data - This will eventually come from Supabase
const sampleUserData = {
    name: "Alex Johnson",
    major: "Computer Science",
    year: "Junior",
    age: 20,
    profileImage: "https://via.placeholder.com/150",
    housingStatus: "Looking for Housing",
    verified: true,
    matchScore: "85%",
    responseTime: "Fast",
    availability: "Available",
    about: "Hi! I'm looking for a roommate for the upcoming academic year. I'm a pretty chill person who values a clean living space and mutual respect. I enjoy gaming, working out, and exploring Philadelphia. Looking forward to meeting potential roommates!",
    lifestyle: {
        sleepSchedule: "Night Owl",
        noiseLevel: "Moderate",
        cleanliness: "Very Clean",
        guests: "Occasionally"
    },
    interests: [
        "🎮 Gaming",
        "📚 Reading",
        "🏋️ Fitness",
        "🎬 Movies",
        "🍳 Cooking",
        "🎵 Music"
    ],
    housing: {
        location: "University City",
        budget: "$600 - $800/month",
        moveInDate: "September 2024",
        leaseDuration: "12 months"
    }
};

// Initialize the page with user data
function initializePage() {
    loadUserProfile(sampleUserData);
    
    // Get user ID from URL parameter (for future Supabase integration)
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('userId');
    
    if (userId) {
        console.log('Loading profile for user ID:', userId);
        // TODO: Fetch user data from Supabase using userId
        // fetchUserFromSupabase(userId);
    }
}

// Load user profile data into the page
function loadUserProfile(userData) {
    // Basic info
    document.getElementById('profileName').textContent = userData.name;
    document.getElementById('profileMajor').textContent = userData.major;
    document.getElementById('profileYear').textContent = `${userData.year} • ${userData.age} years old`;
    document.getElementById('profileImage').src = userData.profileImage;
    document.getElementById('housingTag').textContent = userData.housingStatus;
    
    // Quick stats
    document.getElementById('matchScore').textContent = userData.matchScore;
    document.getElementById('responseRate').textContent = userData.responseTime;
    document.getElementById('availability').textContent = userData.availability;
    
    // About section
    document.getElementById('aboutText').textContent = userData.about;
    
    // Lifestyle preferences
    document.getElementById('sleepSchedule').textContent = userData.lifestyle.sleepSchedule;
    document.getElementById('noiseLevel').textContent = userData.lifestyle.noiseLevel;
    document.getElementById('cleanliness').textContent = userData.lifestyle.cleanliness;
    document.getElementById('guests').textContent = userData.lifestyle.guests;
    
    // Interests
    const interestsContainer = document.getElementById('interestsContainer');
    interestsContainer.innerHTML = '';
    userData.interests.forEach(interest => {
        const tag = document.createElement('span');
        tag.className = 'interest-tag';
        tag.textContent = interest;
        interestsContainer.appendChild(tag);
    });
    
    // Housing preferences
    document.getElementById('location').textContent = userData.housing.location;
    document.getElementById('budget').textContent = userData.housing.budget;
    document.getElementById('moveInDate').textContent = userData.housing.moveInDate;
    document.getElementById('leaseDuration').textContent = userData.housing.leaseDuration;
}

// Navigate back to previous page
function goBack() {
    // Check if there's history to go back to
    if (window.history.length > 1) {
        window.history.back();
    } else {
        // If no history, redirect to a default page (e.g., search/browse page)
        window.location.href = 'browse.html'; // Update with your actual browse page URL
    }
}

// Send message to user
function sendMessage() {
    const userName = document.getElementById('profileName').textContent;
    
    // TODO: Integrate with your messaging system
    console.log('Sending message to:', userName);
    
    // For now, show a confirmation
    alert(`Opening message conversation with ${userName}...`);
    
    // Future: Redirect to messaging page or open modal
    // window.location.href = `messages.html?userId=${userId}`;
}

// Save/bookmark profile
function saveProfile() {
    const userName = document.getElementById('profileName').textContent;
    const saveButton = event.target.closest('button');
    
    // Toggle saved state
    if (saveButton.textContent.includes('Save Profile')) {
        saveButton.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path d="M5 3C3.89543 3 3 3.89543 3 5V17L10 13L17 17V5C17 3.89543 16.1046 3 15 3H5Z"/>
            </svg>
            Saved!
        `;
        saveButton.className = 'flex-1 min-w-[200px] flex items-center justify-center gap-2 px-6 py-4 bg-drexel-gold text-drexel-blue font-semibold rounded-xl border-2 border-drexel-gold transition-all';
        
        console.log('Profile saved:', userName);
        
        // TODO: Save to Supabase user's saved profiles
        // saveToSupabase(userId);
        
        // Show feedback
        showNotification('Profile saved successfully!');
    } else {
        saveButton.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M5 3C3.89543 3 3 3.89543 3 5V17L10 13L17 17V5C17 3.89543 16.1046 3 15 3H5Z" stroke="currentColor" stroke-width="2"/>
            </svg>
            Save Profile
        `;
        saveButton.className = 'flex-1 min-w-[200px] flex items-center justify-center gap-2 px-6 py-4 bg-white text-drexel-blue font-semibold rounded-xl border-2 border-drexel-blue hover:bg-drexel-blue hover:text-white transition-all';
        
        console.log('Profile unsaved:', userName);
        
        // TODO: Remove from Supabase saved profiles
        // removeFromSupabase(userId);
        
        showNotification('Profile removed from saved');
    }
}

// Show notification (simple implementation)
function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #07294D;
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(7, 41, 77, 0.3);
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    
    // Add animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Future function to fetch user data from Supabase
async function fetchUserFromSupabase(userId) {
    try {
        // TODO: Implement Supabase query
        // const { data, error } = await supabase
        //     .from('users')
        //     .select('*')
        //     .eq('id', userId)
        //     .single();
        
        // if (error) throw error;
        // loadUserProfile(data);
        
        console.log('Fetching user from Supabase:', userId);
    } catch (error) {
        console.error('Error fetching user:', error);
        showNotification('Error loading profile');
    }
}

// Calculate match score (placeholder for future algorithm)
function calculateMatchScore(currentUser, targetUser) {
    // TODO: Implement matching algorithm based on preferences
    // This could consider:
    // - Lifestyle preferences compatibility
    // - Budget compatibility
    // - Move-in date compatibility
    // - Shared interests
    
    let score = 0;
    // Add your matching logic here
    return score + '%';
}

// Initialize page when DOM is loaded
document.addEventListener('DOMContentLoaded', initializePage);

// Handle window resize for responsive adjustments
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        console.log('Window resized');
        // Add any resize-specific logic here if needed
    }, 250);
});

// Prevent default form submissions if you add forms later
document.addEventListener('submit', (e) => {
    e.preventDefault();
    console.log('Form submission prevented');
});