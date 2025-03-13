<script>
    let { text } = $props();
</script>

<div>This is base64 reader:</div>
<div>
    {atob(text)}
</div>
