function nevermind() {
    document.querySelector('dialog').removeAttribute('open')
}

function checkOrientation() {
    const warningMessage = document.querySelector('.warning-message');
    if (window.innerHeight > window.innerWidth) {
        warningMessage.classList.remove('d-none');
    } else {
        warningMessage.classList.add('d-none');
    }
}
window.addEventListener('resize', checkOrientation);
window.addEventListener('load', checkOrientation);