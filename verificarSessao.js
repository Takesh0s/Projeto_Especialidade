(async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error || !session) {
    window.location.href = "index.html";
  }
})();