function saveProfile() {

    // Get values from inputs
    const name = document.getElementById("nameInput").value;
    const major = document.getElementById("majorInput").value;
    const year = document.getElementById("yearInput").value;
    const birthday = document.getElementById("birthdayInput").value;
    const age = document.getElementById("ageInput").value;
    const bio = document.getElementById("bioInput").value;

    // Display updated profile information
    document.getElementById("displayName").innerText = name;
    document.getElementById("displayMajor").innerText = major;
    document.getElementById("displayYear").innerText = year;
    document.getElementById("displayBirthday").innerText = birthday;
    document.getElementById("displayAge").innerText = age;
    document.getElementById("displayBio").innerText = bio;

    // Confirmation message
    document.getElementById("confirmationMessage").innerText =
        "Profile updated successfully!";
}
