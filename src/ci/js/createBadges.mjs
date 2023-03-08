// Create badge icons for tests and coverage.
// Usage: node createBadges.mjs <coverage-badge-filename> <tests-badge-filename>

import fs  from 'fs'
import { makeBadge } from 'badge-maker'

import { createRequire } from 'module'
const require = createRequire(import.meta.url)

// Create coverage badge
const covSummary = require('../coverage/coverage-summary.json')
const covPct = covSummary.total.statements.pct

let color = 'green'
if (covPct < 20) color = 'red'
else if (covPct < 70) color = '#ffa500' // orange_2

const covBadge = {
    label: 'coverage',
    message: covPct.toFixed(0) + '%',
    color: color
}
const covSvg = makeBadge(covBadge)

// Create badge for shields.io
// const covBadge = {
//     schemaVersion: 1,
//     label: 'coverage',
//     message: covPct.toFixed(0) + '%',
//     color: color
// }
// console.log("covBadge:", JSON.stringify(covBadge))
// fs.writeFileSync(process.argv[2], JSON.stringify(covBadge))

// Create test results badge
const testSummary = require('../test-results.json')
const numPassedTests = testSummary.numPassedTests
const numFailedTests = testSummary.numFailedTests
color = numPassedTests != 0 && numFailedTests == 0? 'green' : 'red'

const testBadge = {
    label: 'tests',
    message: numPassedTests + " passed, " + numFailedTests + " failed",
    color: color
}
const testSvg = makeBadge(testBadge)

// Write badge files.
let covBadgeFile = process.argv[2] == undefined? "cov-badge.svg" : process.argv[2]
let testBadgeFile = process.argv[3] == undefined? "test-badge.svg" : process.argv[3]
fs.writeFile(covBadgeFile, covSvg, err => {
    if (err) {
        console.log(`Error writing ${covBadgeFile}: ${err.message}`)
        process.exit(1)
    }
    fs.writeFile(testBadgeFile, testSvg, err => {
        if (err) {
            console.log(`Error writing ${testBadgeFile}: ${err.message}`)
            process.exit(1)
        }
        console.log(`Created ${covBadgeFile} and ${testBadgeFile}`)
    })
})
