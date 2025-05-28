const send = cmd => fetch('/api/command', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(cmd)
});

document.getElementById('on').onclick = () => send({ type: 'on' });
document.getElementById('off').onclick = () => send({ type: 'off' });
document.getElementById('brightness').oninput = e =>
  send({ type: 'brightness', payload: +e.target.value });
document.getElementById('colorPicker').onchange = e =>
  send({ type: 'color', payload: e.target.value });
document.getElementById('sendMorse').onclick = () =>
  send({ type: 'morse', payload: document.getElementById('morse').value });
