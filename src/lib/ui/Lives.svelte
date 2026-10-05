<script lang="ts">
	interface Props {
		total: number;
		left: number;
	}

	let { total, left }: Props = $props();
</script>

<span>{left}/{total}</span>
