<script>
  function typedArrayToURL(typedArray, mimeType) {
  return URL.createObjectURL(new Blob([typedArray.buffer], {type: mimeType}))
}

const bytes = new Uint8Array(59);

for(let i = 0; i < 59; i++) {
  bytes[i] = 32 + i;
}

const url = typedArrayToURL(bytes, 'text/plain');

const link = document.createElement('a');
link.href = url;
link.innerText = 'Open the array URL';

document.body.appendChild(link);
</script>
