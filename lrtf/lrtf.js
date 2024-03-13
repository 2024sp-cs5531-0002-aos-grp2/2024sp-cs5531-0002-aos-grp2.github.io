document.addEventListener('DOMContentLoaded', function () {
    // Initialize the LRTF simulation when the page loads
    simulateLRTF();
});

// Function to start LRTF simulation
function startLRTF() {
    const processes = [];
    const processCount = document.getElementById('processCount').value;

    for (let i = 1; i <= processCount; i++) {
        const burstTime = parseInt(document.getElementById(`burstTime${i}`).value);

        processes.push({ id: `P${i}`, burstTime, remainingTime: burstTime });
    }

    // Call LRTF simulation logic
    simulateLRTF(processes);
}

function simulateLRTF(processes) {
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
        <p>Total Execution Time: <span id="totalExecutionTime">0</span>s</p>
        <p>Average Waiting Time: <span id="averageWaitingTime">0</span>s</p>
        <p>Average Turnaround Time: <span id="averageTurnaroundTime">0</span>s</p>
    `;

    while (executedProcesses.length < processes.length) {
        const eligibleProcesses = processes.filter(p => p.remainingTime > 0);

        if (eligibleProcesses.length > 0) {
            eligibleProcesses.sort((p1, p2) => p2.remainingTime - p1.remainingTime);
            const currentProcess = eligibleProcesses[0];

            const remainingBurstTime = currentProcess.remainingTime;
            currentProcess.remainingTime = 0;

            currentProcess.waitingTime = currentTime;
            totalWaitingTime += currentProcess.waitingTime;

            readyQueue.push(currentProcess);
            updateReadyQueue(readyQueue);

            currentTime += remainingBurstTime;

            currentProcess.turnaroundTime = currentProcess.waitingTime + currentProcess.burstTime;
            totalTurnaroundTime += currentProcess.turnaroundTime;
            executedProcesses.push(currentProcess);

            setTimeout(() => {
                updateProcessPipeline(currentProcess);
                readyQueue = readyQueue.filter(p => p !== currentProcess);
                updateReadyQueue(readyQueue);
            }, currentTime * 500);
        } else {
            currentTime++;
        }
    }

    const averageWaitingTime = (totalWaitingTime / processes.length).toFixed(2);
    const totalExecutionTime = currentTime.toFixed(2);

    document.getElementById('totalExecutionTime').textContent = totalExecutionTime;
    document.getElementById('averageWaitingTime').textContent = averageWaitingTime;
    document.getElementById('averageTurnaroundTime').textContent = calculateAverageTurnaroundTime(executedProcesses);
}

function calculateAverageTurnaroundTime(processes) {
    const totalTurnaroundTime = processes.reduce((sum, process) => sum + process.turnaroundTime, 0);
    return (totalTurnaroundTime / processes.length).toFixed(2);
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
