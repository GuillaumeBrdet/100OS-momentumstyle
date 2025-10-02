// Close popup when link is clicked
document.querySelectorAll('.link-item').forEach(link => {
  link.addEventListener('click', () => {
    window.close();
  });
});