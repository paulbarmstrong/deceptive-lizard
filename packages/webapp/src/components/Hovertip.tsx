import { useRef, useEffect, useState } from "react"
import { useRefState } from "../hooks/useRefState"
import { useScrollY } from "../hooks/useScrollY"

interface Props {
	inverted: boolean,
	estimatedWidth: number,
	pointerEvents: boolean,
	textColor: string,
	enabledOverride: boolean
}

const defaultProps = {
	inverted: false,
	estimatedWidth: 0,
	pointerEvents: true,
	textColor: "white",
	enabledOverride: false
}

const Z_INDEX = 200

export function Hovertip(props: React.PropsWithChildren<Props>) {
	const tooltipEl = useRef<HTMLDivElement>(null)
	const parentEl = useRefState<HTMLElement | undefined>(undefined)
	const [mouseOverParent, setMouseOverParent] = useState<boolean>(false)

	useEffect(() => {
		const parent = tooltipEl.current?.parentElement
		if (parent != undefined) {
			parentEl.current = parent
			parent.addEventListener("mouseenter", onMouseEnterParent)
			parent.addEventListener("mouseleave", onMouseLeaveParent)
			return () => {
				parent.removeEventListener("mouseenter", onMouseEnterParent)
				parent.removeEventListener("mouseleave", onMouseLeaveParent)
			}
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [tooltipEl])

	function onMouseEnterParent() {
		setMouseOverParent(true)
	}

	function onMouseLeaveParent() {
		setMouseOverParent(false)
	}

	const enabled = mouseOverParent || props.enabledOverride

	if (parentEl.current != undefined && enabled) {
		return <HovertipAux parentEl={parentEl.current} inverted={props.inverted} estimatedWidth={props.estimatedWidth} pointerEvents={props.pointerEvents} textColor={props.textColor}>
			{props.children}
		</HovertipAux>
	} else {
		return <div ref={tooltipEl}/>
	}
}

interface AuxProps {
	parentEl: HTMLElement,
	inverted: boolean,
	estimatedWidth: number,
	pointerEvents: boolean,
	textColor: string
}

function HovertipAux(props: React.PropsWithChildren<AuxProps>) {
	useScrollY()

	const triangleSize = 10
	const rect = props.parentEl.getBoundingClientRect()
	const centerX = rect.left + (rect.width/2)
	const centerY = rect.top + (rect.height/2)
	return <div style={{pointerEvents: props.pointerEvents ? undefined : "none", color: props.textColor}}>
		<div style={{zIndex: Z_INDEX, position: "fixed", left: centerX,
			top: props.inverted ? undefined : centerY - 2*triangleSize,
			bottom: props.inverted ? window.innerHeight - centerY - 2*triangleSize : undefined,
			height: 0, width: 0,
			display: "flex", justifyContent: "center", alignItems: "center"
		}}>
			<div style={{height: 0, width: 0,
				borderTopStyle: props.inverted ? undefined : "solid",
				borderTopColor: props.inverted ? undefined : "black",
				borderTopWidth: props.inverted ? undefined : triangleSize,
				borderBottomStyle: props.inverted ? "solid" : undefined,
				borderBottomColor: props.inverted ? "black" : undefined,
				borderBottomWidth: props.inverted ? triangleSize : undefined,
				borderLeftStyle: "solid", borderLeftColor: "transparent", borderLeftWidth: triangleSize,
				borderRightStyle: "solid", borderRightColor: "transparent", borderRightWidth: triangleSize
			}}/>
		</div>
		{
			centerX < props.estimatedWidth ? (
				<div style={{zIndex: Z_INDEX, position: "fixed", left: 0, bottom: window.innerHeight - centerY + 2.5*triangleSize, backgroundColor: "black", borderRadius: 4, height: "auto", padding: 5, textAlign: "center"}}>
					{props.children}
				</div>
			) : (
				<div style={{zIndex: Z_INDEX, position: "fixed", left: centerX,
					bottom: props.inverted ? undefined : window.innerHeight - centerY + 2.5*triangleSize,
					top: props.inverted ? centerY + 2.5*triangleSize : undefined,
					height: "auto", width: 0,
					display: "flex", justifyContent: "center", alignItems: "center"
				}}>
					<span style={{zIndex: Z_INDEX, backgroundColor: "black", borderRadius: 4, height: "auto", width: "auto",
					whiteSpace: "nowrap", padding: 5, textAlign: "center"}}>
						{props.children}
					</span>
				</div>
			)
		}
	</div>
}

Hovertip.defaultProps = defaultProps