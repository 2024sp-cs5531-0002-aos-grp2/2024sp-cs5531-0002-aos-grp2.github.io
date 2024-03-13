// roundrobin.js

document.addEventListener('DOMContentLoaded', function () {
    // Initialize the Round Robin simulation when the page loads
    simulateRoundRobin();
});

// Function to start Round Robin simulation
function startRoundRobin() {
    const processes = [];
    const processCount = document.getElementById('processCount').value;

    for (let i = 1; i <= processCount; i++) {
        const arrivalTime = parseInt(document.getElementById(`arrivalTime${i}`).value);
        const burstTime = parseInt(document.getElementById(`burstTime${i}`).value);
        const priority = parseInt(document.getElementById(`priority${i}`).value);

        processes.push({ id: `P${i}`, arrivalTime, burstTime, remainingTime: burstTime, priority });
    }

    const timeQuantum = parseInt(document.getElementById('timeQuantum').value);

    // Call Round Robin simulation logic
    simulateRoundRobin(processes, timeQuantum);
}

function simulateRoundRobin(processes, timeQuantum) {
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
            eligibleProcesses.sort((p1, p2) => p1.priority - p2.priority);
            const currentProcess = eligibleProcesses[0];

            currentProcess.waitingTime = currentTime - currentProcess.arrivalTime;
            totalWaitingTime += currentProcess.waitingTime;

            readyQueue.push(currentProcess);
            updateReadyQueue(readyQueue);

            const executionTime = Math.min(timeQuantum, currentProcess.remainingTime);
            currentTime += executionTime;
            currentProcess.remainingTime -= executionTime;

            if (currentProcess.remainingTime === 0) {
                currentProcess.turnaroundTime = currentProcess.waitingTime + currentProcess.burstTime;
                totalTurnaroundTime += currentProcess.turnaroundTime;
                executedProcesses.push(currentProcess);

                setTimeout(() => {
                    updateProcessPipeline(currentProcess);
                    readyQueue = readyQueue.filter(p => p !== currentProcess);
                    updateReadyQueue(readyQueue);
                }, (currentTime - executionTime) * 500);
            } else {
                setTimeout(() => {
                    readyQueue.push({ id: currentProcess.id, remainingTime: currentProcess.remainingTime });
                    updateReadyQueue(readyQueue);
                }, (currentTime - executionTime) * 500);
            }
        } else {
            currentTime++;
        }
    }

    const averageWaitingTime = (totalWaitingTime / processes.length).toFixed(2);
    const totalExecutionTime = currentTime.toFixed(2);

    document.getElementById('totalExecutionTime').textContent = totalExecutionTime;
    document.getElementById('averageWaitingTime').textContent = calculateAverageTurnaroundTime(executedProcesses);
    document.getElementById('averageTurnaroundTime').textContent = averageWaitingTime;
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
