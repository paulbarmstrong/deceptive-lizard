import { useEffect, useRef, useState } from "react"
import { useFrames } from "../hooks/useFrames"

interface Props {
	color: string,
	lineWidth: number
}

const defaultProps = {
	color: "white",
	lineWidth: 2
}

export function LoadingSpinner(props: Props) {
	const canvas = useRef<HTMLCanvasElement>(null)
	const [startTime] = useState<number>(Date.now())
	useFrames(refresh)

	function refresh() {
		const t = (Date.now() - startTime) / 1000

		if (canvas.current) {
			const canvasWidth = canvas.current.width
			const canvasHeight = canvas.current.height
			if (canvasWidth > 0 && canvasHeight > 0) {
				const canvasContext = canvas.current.getContext("2d")!
				canvasContext.clearRect(0, 0, canvasWidth, canvasHeight)
				canvasContext.lineWidth = props.lineWidth
				canvasContext.strokeStyle = props.color
		
				const startAngle = 2 * Math.PI * ((t*1.5) % 1)
				const endAngle = 2 * Math.PI * ((t*1.5 + 0.5) % 1)
		
				canvasContext.beginPath()
				canvasContext.arc(canvasWidth/2, canvasHeight/2, (Math.min(canvasWidth, canvasHeight) - props.lineWidth)/2, startAngle, endAngle)
				canvasContext.stroke()
			}
		}
	}

	useEffect(() => {
		if (canvas.current) {
			canvas.current.width = canvas.current.clientWidth
			canvas.current.height = canvas.current.clientHeight
		}
	}, [])

	return <canvas ref={canvas} style={{width: "100%", height: "100%"}}/>
}

LoadingSpinner.defaultProps = defaultProps