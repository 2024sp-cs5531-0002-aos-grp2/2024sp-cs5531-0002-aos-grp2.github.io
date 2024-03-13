// fcfs.js

document.addEventListener('DOMContentLoaded', function () {
    // ... (Your existing code)

    // Initialize the FCFS simulation when the page loads
    simulateFCFS();
});

// Function to start FCFS simulation
function startFCFS() {
    const processes = [];
    const processCount = document.getElementById('processCount').value;

    for (let i = 1; i <= processCount; i++) {
        const arrivalTime = parseInt(document.getElementById(`arrivalTime${i}`).value);
        const burstTime = parseInt(document.getElementById(`burstTime${i}`).value);

        processes.push({ id: `P${i}`, arrivalTime, burstTime });
    }

    // Call FCFS simulation logic
    simulateFCFS(processes);
}


function simulateFCFS(processes) {
    processes.sort((p1, p2) => p1.arrivalTime - p2.arrivalTime);

    let currentTime = 0;
    let totalWaitingTime = 0;
    let totalTurnaroundTime = 0;
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

    processes.forEach(process => {
        process.waitingTime = Math.max(currentTime - process.arrivalTime, 0);
        totalWaitingTime += process.waitingTime;

        setTimeout(() => {
            readyQueue.push({ id: process.id, waitingTime: process.waitingTime });
            updateReadyQueue(readyQueue);
        }, process.arrivalTime * 500); // Increased the ready queue update speed

        currentTime = Math.max(currentTime, process.arrivalTime) + process.burstTime;
        process.turnaroundTime = process.waitingTime + process.burstTime;
        totalTurnaroundTime += process.turnaroundTime;

        setTimeout(() => {
            updateProcessPipeline(process);
        }, (process.arrivalTime + process.waitingTime) * 500); // Increased the process pipeline update speed
    });

    const averageWaitingTime = (totalWaitingTime / processes.length).toFixed(2);
    const totalExecutionTime = currentTime.toFixed(2);

    document.getElementById('totalExecutionTime').textContent = totalExecutionTime;
    document.getElementById('averageWaitingTime').textContent = averageWaitingTime;
    document.getElementById('averageTurnaroundTime').textContent = calculateAverageTurnaroundTime(processes);
}

function calculateAverageTurnaroundTime(processes) {
    const totalTurnaroundTime = processes.reduce((sum, process) => sum + process.turnaroundTime, 0);
    return (totalTurnaroundTime / processes.length).toFixed(2);
}

function updateReadyQueue(queue) {
    const readyQueueDiv = document.getElementById('readyQueue');
    readyQueueDiv.innerHTML = queue.map(process => `
        <div class="process-horizontal" style="animation-duration:${process.waitingTime}s;">
            ${process.id} (Wait: ${process.waitingTime}s)
        </div>
    `).join('');
}



function updateProcessPipeline(process) {
    const processPipelineDiv = document.getElementById('processPipeline');
    const processBlock = document.createElement('div');
    processBlock.className = 'process';
    processBlock.style.animationDuration = `${process.burstTime}s`;
    processBlock.style.animationDelay = `${process.waitingTime}s`;
    processBlock.innerHTML = `${process.id} (Wait: ${process.waitingTime}s, Burst: ${process.burstTime}s)`;

    processPipelineDiv.appendChild(processBlock);
}

