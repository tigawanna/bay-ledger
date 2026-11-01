export  async function invoke(name: string, body: string) {
  const response = await fetch(`/lambda/2015-03-31/functions/${name}/invocations`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body,
  });
  const text = await response.text();
  if (!response.ok) throw new Error(text || `invoke failed (${response.status})`);
  return text;
}
