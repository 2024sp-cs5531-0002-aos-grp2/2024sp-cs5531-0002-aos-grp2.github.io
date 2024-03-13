document.addEventListener('DOMContentLoaded', function () {
    // Initialize the SRTF simulation when the page loads
    simulateSRTF();
});

// Function to start SRTF simulation
function startSRTF() {
    const processes = [];
    const processCount = document.getElementById('processCount').value;

    for (let i = 1; i <= processCount; i++) {
        const arrivalTime = parseInt(document.getElementById(`arrivalTime${i}`).value);
        const burstTime = parseInt(document.getElementById(`burstTime${i}`).value);

        processes.push({ id: `P${i}`, arrivalTime, burstTime, remainingTime: burstTime });
    }

    // Call SRTF simulation logic
    simulateSRTF(processes);
}

function simulateSRTF(processes) {
    processes.sort((p1, p2) => p1.arrivalTime - p2.arrivalTime);

    let currentTime = 0;
    let totalWaitingTime = 0;
    let totalTurnaroundTime = 0;
    let executedProcesses = [];
    let readyQueue = [];

    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = `
        <div class="pipeline-horizontal" id="top-pipeline">
            <p>Ready Queue:</p>
            <div id="readyQueue" class="ready-queue"></div>
        </div>
        <div class="space"></div>
        <div class="pipeline-horizontal" id="bottom-pipeline">
            <p>Process Execution Pipeline:</p>
            <div id="processPipeline" class="process-pipeline"></div>
        </div>
        <p><b>Total Execution Time: <span id="totalExecutionTime">0</span>s</b></p>
        <p><b>Average Waiting Time: <span id="averageWaitingTime">0</span>s</b></p>
        <p><b>Average Turnaround Time: <span id="averageTurnaroundTime">0</span>s</b></p>
    `;

    while (executedProcesses.length < processes.length) {
        const eligibleProcesses = processes.filter(p => p.arrivalTime <= currentTime && p.remainingTime > 0);

        if (eligibleProcesses.length > 0) {
            eligibleProcesses.sort((p1, p2) => p1.remainingTime - p2.remainingTime);
            const currentProcess = eligibleProcesses[0];

            if (!readyQueue.find(p => p.id === currentProcess.id)) {
                currentProcess.waitingTime = currentTime - currentProcess.arrivalTime;
                totalWaitingTime += currentProcess.waitingTime;

                readyQueue.push({ id: currentProcess.id, remainingTime: currentProcess.remainingTime });
                updateReadyQueue(readyQueue);
            }

            const timeSlice = 1; // Adjust the time slice as needed
            currentTime += timeSlice;

            // Update the remaining time for the current process
            currentProcess.remainingTime -= timeSlice;

            if (currentProcess.remainingTime === 0) {
                currentProcess.turnaroundTime = currentTime - currentProcess.arrivalTime;
                totalTurnaroundTime += currentProcess.turnaroundTime;
                executedProcesses.push(currentProcess);

                setTimeout(() => {
                    updateProcessPipeline(currentProcess);
                    readyQueue = readyQueue.filter(p => p.id !== currentProcess.id);
                    updateReadyQueue(readyQueue);
                }, (currentTime - currentProcess.burstTime) * 500);
            }
        } else {
            currentTime++;
        }
    }

    const averageWaitingTime = (totalWaitingTime / processes.length).toFixed(2);
    const totalExecutionTime = currentTime.toFixed(2);
    const averageTurnaroundTime = (totalTurnaroundTime / executedProcesses.length).toFixed(2);

    document.getElementById('totalExecutionTime').textContent = totalExecutionTime;
    document.getElementById('averageWaitingTime').textContent = averageWaitingTime;
    document.getElementById('averageTurnaroundTime').textContent = averageTurnaroundTime;
}

function updateReadyQueue(queue) {
    const readyQueueDiv = document.getElementById('readyQueue');
    readyQueueDiv.innerHTML = queue.map(process => `
        <div class="process-horizontal" style="animation-duration:${1}s;">
            ${process.id} (Remaining: ${process.remainingTime}s)
        </div>
    `).join('');
}

function updateProcessPipeline(process) {
    const processPipelineDiv = document.getElementById('processPipeline');
    processPipelineDiv.innerHTML += `
        <div class="process" style="animation-duration:${process.burstTime}s; animation-delay:${process.waitingTime}s">
            ${process.id} (Wait: ${process.waitingTime}s)
        </div>
    `;
}
