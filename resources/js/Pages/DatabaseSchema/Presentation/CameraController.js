/**
 * CameraController.js
 * Handles cinematic camera panning, zooming, and transitions for ReactFlow.
 */

export const easeInOutCubic = (t) => {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};

export class CameraController {
    /**
     * @param {Object} reactFlowInstance React Flow instance ({ setCenter, fitView, fitBounds, getViewport, setViewport })
     */
    constructor(reactFlowInstance) {
        this.flow = reactFlowInstance;
        this.animationFrameId = null;
    }

    /**
     * Cancel any active manual camera animation
     */
    cancel() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }

    /**
     * Smoothly focus on a single table
     * @param {Object} node React Flow node
     * @param {number} zoom Target zoom level (1.2 to 1.5)
     * @param {number} duration Transition duration in ms
     */
    focusTable(node, zoom = 1.35, duration = 1200) {
        this.cancel();
        if (!node || !this.flow?.setCenter) {
            return;
        }

        const nodeWidth = 288;
        const nodeHeight = 110;
        const posX = typeof node.position?.x === 'number' ? node.position.x : 0;
        const posY = typeof node.position?.y === 'number' ? node.position.y : 0;
        const centerX = posX + nodeWidth / 2;
        const centerY = posY + nodeHeight / 2;

        if (isFinite(centerX) && isFinite(centerY)) {
            this.flow.setCenter(centerX, centerY, {
                zoom,
                duration,
            });
        }
    }

    /**
     * Smoothly focus on a group / module of tables
     * @param {Array} nodes Array of nodes belonging to the module
     * @param {number} duration Transition duration in ms
     */
    focusModule(nodes, duration = 1400) {
        this.cancel();
        if (!nodes || !nodes.length || !this.flow) {
            return;
        }

        let minX = Infinity;
        let minY = Infinity;
        let maxX = -Infinity;
        let maxY = -Infinity;

        nodes.forEach((n) => {
            const posX = typeof n.position?.x === 'number' ? n.position.x : 0;
            const posY = typeof n.position?.y === 'number' ? n.position.y : 0;
            minX = Math.min(minX, posX);
            minY = Math.min(minY, posY);
            maxX = Math.max(maxX, posX + 288);
            maxY = Math.max(maxY, posY + 110);
        });

        if (!isFinite(minX) || !isFinite(minY) || !isFinite(maxX) || !isFinite(maxY)) {
            this.showOverview(duration);
            return;
        }

        const padding = 120;
        const width = maxX - minX;
        const height = maxY - minY;
        const centerX = minX + width / 2;
        const centerY = minY + height / 2;

        if (this.flow.fitBounds && width > 0 && height > 0) {
            this.flow.fitBounds(
                {
                    x: minX - padding,
                    y: minY - padding,
                    width: width + padding * 2,
                    height: height + padding * 2,
                },
                { duration }
            );
        } else if (this.flow.setCenter && isFinite(centerX) && isFinite(centerY)) {
            this.flow.setCenter(centerX, centerY, {
                zoom: 0.85,
                duration,
            });
        }
    }

    /**
     * Smoothly glide camera between two related tables
     * @param {Object} sourceNode Source table node
     * @param {Object} targetNode Target table node
     * @param {number} duration Duration in ms
     */
    followRelationship(sourceNode, targetNode, duration = 1600) {
        this.cancel();
        if (!sourceNode || !targetNode || !this.flow) {
            return;
        }

        const sX = (typeof sourceNode.position?.x === 'number' ? sourceNode.position.x : 0) + 144;
        const sY = (typeof sourceNode.position?.y === 'number' ? sourceNode.position.y : 0) + 55;
        const tX = (typeof targetNode.position?.x === 'number' ? targetNode.position.x : 0) + 144;
        const tY = (typeof targetNode.position?.y === 'number' ? targetNode.position.y : 0) + 55;

        // Position camera halfway between source and target
        const midX = (sX + tX) / 2;
        const midY = (sY + tY) / 2;

        if (!isFinite(midX) || !isFinite(midY)) {
            return;
        }

        const distance = Math.hypot(tX - sX, tY - sY);
        // Calculate appropriate zoom so both ends are visible
        const targetZoom = Math.min(Math.max(800 / (distance + 400), 0.75), 1.25);

        if (this.flow.setCenter) {
            this.flow.setCenter(midX, midY, {
                zoom: targetZoom,
                duration,
            });
        }
    }

    /**
     * Zoom out to reveal the full database architecture
     * @param {number} duration Duration in ms
     */
    showOverview(duration = 1400) {
        this.cancel();
        if (this.flow?.fitView) {
            this.flow.fitView({
                padding: 0.15,
                duration,
            });
        }
    }
}
