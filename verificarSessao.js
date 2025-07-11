(async () => {
  const { data, error } = await supabase.auth.getSession();
  const session = data?.session;

  if (error || !session) {
    window.location.href = "index.html";
  }
})();