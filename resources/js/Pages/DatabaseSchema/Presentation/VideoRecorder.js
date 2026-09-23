/**
 * VideoRecorder.js
 * Handles recording the presentation in 1920x1080 30FPS using MediaRecorder API.
 */

export class VideoRecorder {
    constructor() {
        this.mediaRecorder = null;
        this.recordedChunks = [];
        this.stream = null;
        this.isRecording = false;
        this.startTime = null;
        this.timerInterval = null;
        this.onProgressCallback = null;
    }

    /**
     * Determine best supported MIME type (prefer MP4, fallback to WebM)
     */
    getSupportedMimeType() {
        if (typeof MediaRecorder === 'undefined') {
            return null;
        }

        const candidateTypes = [
            'video/mp4;codecs=avc1.42E01E,mp4a.40.2',
            'video/mp4;codecs=avc1',
            'video/mp4',
            'video/webm;codecs=vp9,opus',
            'video/webm;codecs=vp8,opus',
            'video/webm',
        ];

        for (const type of candidateTypes) {
            if (MediaRecorder.isTypeSupported(type)) {
                return type;
            }
        }

        return 'video/webm';
    }

    /**
     * Start recording presentation
     * @param {HTMLElement} targetElement Container element to capture or use display media
     * @param {Function} onProgress Callback for elapsed time updates
     */
    async startRecording(targetElement, onProgress) {
        if (this.isRecording) {
            return;
        }

        this.recordedChunks = [];
        this.onProgressCallback = onProgress;

        try {
            // Use browser display capture stream (captures clean DOM with 60fps GPU acceleration)
            if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
                this.stream = await navigator.mediaDevices.getDisplayMedia({
                    video: {
                        displaySurface: 'browser',
                        width: { ideal: 1920 },
                        height: { ideal: 1080 },
                        frameRate: { ideal: 30, max: 60 },
                    },
                    audio: false,
                    preferCurrentTab: true,
                });
            } else {
                throw new Error('Screen capture API tidak didukung di browser ini.');
            }

            const mimeType = this.getSupportedMimeType();
            this.mediaRecorder = new MediaRecorder(this.stream, {
                mimeType,
                videoBitsPerSecond: 6000000, // 6 Mbps high quality 1080p
            });

            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data && event.data.size > 0) {
                    this.recordedChunks.push(event.data);
                }
            };

            this.mediaRecorder.onstop = () => {
                this.finishAndDownload(mimeType);
            };

            // Detect if user stopped sharing via browser bar
            const videoTrack = this.stream.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.onended = () => {
                    this.stopRecording();
                };
            }

            this.mediaRecorder.start(1000); // 1-second chunks
            this.isRecording = true;
            this.startTime = Date.now();

            this.timerInterval = setInterval(() => {
                if (this.onProgressCallback) {
                    const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
                    this.onProgressCallback(elapsed);
                }
            }, 1000);

            return true;
        } catch (error) {
            console.error('Failed to start recording:', error);
            this.cleanup();
            throw error;
        }
    }

    /**
     * Stop recording and initiate download
     */
    stopRecording() {
        if (!this.isRecording) return;

        this.isRecording = false;
        clearInterval(this.timerInterval);

        if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
            this.mediaRecorder.stop();
        }

        if (this.stream) {
            this.stream.getTracks().forEach((track) => track.stop());
            this.stream = null;
        }
    }

    /**
     * Finalize blob and trigger direct file download
     */
    finishAndDownload(mimeType) {
        if (!this.recordedChunks.length) {
            this.cleanup();
            return;
        }

        const isMp4 = mimeType.includes('mp4');
        const ext = isMp4 ? 'mp4' : 'webm';
        const blob = new Blob(this.recordedChunks, { type: mimeType });

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        const dateStr = new Date().toISOString().slice(0, 10);
        a.download = `Plant_CMMS_Database_Architecture_1080p_${dateStr}.${ext}`;
        document.body.appendChild(a);
        a.click();

        setTimeout(() => {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            this.cleanup();
        }, 100);
    }

    cleanup() {
        this.isRecording = false;
        this.recordedChunks = [];
        clearInterval(this.timerInterval);
        if (this.stream) {
            this.stream.getTracks().forEach((track) => track.stop());
            this.stream = null;
        }
    }
}
