<script lang="ts">
	interface Props {
		step: number;
		total: number;
		text: string;
		onexit: () => void;
	}

	let { step, total, text, onexit }: Props = $props();
</script>

<p>{text}</p>
