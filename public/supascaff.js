import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Supabase credentials
const supabaseUrl = 'https://isgkixzpsjvofwcujgkg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlzZ2tpeHpwc2p2b2Z3Y3VqZ2tnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE5NjMyNzgsImV4cCI6MjA1NzUzOTI3OH0.2poprXvbJ44LJI1EXwUPYIMA7lvcCVRSJiPyh19poms';

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Fetch all trades from Supabase using pagination to bypass the 1000-row limit.
 * 
 * @returns {Promise<string[]>} A promise that resolves to an array of trade names.
 */
async function fetchAllTrades() {
    let allTrades = [];
    let from = 0;
    const batchSize = 1000;
    let moreData = true;

    try {
        while (moreData) {
            const { data, error } = await supabase
                .from("Trades")
                .select("trade")
                .range(from, from + batchSize - 1); // Fetch rows in batches

            if (error) {
                console.error("Error fetching trades:", error.message);
                return []; // Return empty array if there's an error
            }

            if (data.length > 0) {
                allTrades = [...allTrades, ...data.map(trade => trade.trade)];
                from += batchSize;
            } else {
                moreData = false; // Stop when no more data
            }
        }

        console.log(`Fetched ${allTrades.length} trades.`);
        return allTrades;
    } catch (err) {
        console.error("Unexpected error fetching trades:", err);
        return [];
    }
}

/**
 * Capture form submission and send data to Supabase.
 */
async function submitQuote() {
    // Identify which section is filled (only one is active per submission)
    const insuranceType = document.querySelector('input[name="insuranceType"]:checked')?.value || null;

    // Shared Fields (Only one section is completed per form submission)
    const fullName = document.querySelector(`#${insuranceType}Questions2 input[placeholder="Enter your name"]`)?.value || null;
    const email = document.querySelector(`#${insuranceType}Questions2 input[placeholder="Enter email address"]`)?.value || null;
    const phoneNumber = document.querySelector(`#${insuranceType}Questions2 input[placeholder="Enter phone number"]`)?.value || null;

    // Common Fields
    const policyStartDateRaw = document.getElementById(`${insuranceType}PolicyStartDate`)?.value || null;
    const policyStartDate = policyStartDateRaw && policyStartDateRaw.includes("/")
        ? policyStartDateRaw.split("/").reverse().join("-")
        : policyStartDateRaw;

    const anyClaims = document.querySelector(`#${insuranceType}Questions2 input[name$="Claims"]:checked`)?.value || null;
    const propertyRepair = document.querySelector('input[name="propertyRepair"]:checked')?.value || null;
    const propertyConstruction = document.querySelector('input[name="propertyConstruction"]:checked')?.value || null;

    // Business Insurance Fields
    const trade = document.getElementById('tradeName')?.textContent || null;
    const businessType = document.querySelector('input[name="businessType"]:checked')?.value || null;
    const employees = document.querySelector('input[name="employees"]:checked')?.value || null;
    const turnover = document.querySelector('input[name="turnover"]:checked')?.value || null;
    const businessName = document.querySelector(`#${insuranceType}Questions2 input[placeholder="Enter business name"]`)?.value || null;

    // Landlord Insurance Fields
    const tenantType = document.querySelector('input[name="tenantType"]:checked')?.value || null;
    const holidayLet = document.querySelector('input[name="holidayLet"]:checked')?.value || null;
    const buyToLetCount = document.querySelector('input[name="buyToLetCount"]:checked')?.value || null;
    const propertyOccupied = document.querySelector('input[name="propertyOccupied"]:checked')?.value || null;
    const propertyAddress = document.getElementById('propertyAddress')?.value || null;

    // Home Insurance Fields
    const propertyType = document.querySelector('input[name="propertyType"]:checked')?.value || null;
    const construction = document.querySelector('input[name="construction"]:checked')?.value || null;
    const homeAddress = document.getElementById('homeAddress')?.value || null;
    const buildingWorks = document.querySelector('input[name="buildingWorks"]:checked')?.value || null;

    // Construct the submission object
    const quoteData = {
        insurance_type: insuranceType,
        full_name: fullName,
        email: email,
        phone_number: phoneNumber,
        policy_start_date: policyStartDate,
        any_claims: anyClaims === 'Yes',
        property_repair: propertyRepair === 'Yes',
        property_construction: propertyConstruction === 'Yes',

        // Business Insurance
        trade: trade,
        business_type: businessType,
        employees: employees,
        turnover: turnover,
        business_name: businessName,

        // Landlord Insurance
        tenant_type: tenantType,
        holiday_let: holidayLet === 'Yes',
        buy_to_let_count: buyToLetCount,
        landlord_address: propertyAddress,
        property_occupied: propertyOccupied === 'Yes',

        // Home Insurance
        property_type: propertyType,
        construction: construction === 'Yes',
        home_address: homeAddress,
        building_works: buildingWorks === 'Yes',
    };

    console.log("Submitting data:", quoteData);

    // Send to Supabase
    const { data, error } = await supabase
        .from("quote_requests")
        .insert([quoteData]);

    if (error) {
        console.error("Error submitting quote:", error.message);
        alert("An error occurred while submitting your quote. Please try again.");
    } else {
        console.log("Quote submitted successfully:", data);
        // Instead of hiding the entire form container, hide only the step cards:
        document.querySelectorAll('#quoteStepFormContent .card').forEach(card => {
            card.style.display = 'none';
        });
        // Show the success message
        document.getElementById("successMessageContent").style.display = "block";
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// Attach event listener to "Get Quote" button
document.addEventListener("DOMContentLoaded", function () {
    const quoteButton = document.getElementById("quoteFinishBtn");
    if (quoteButton) {
        quoteButton.addEventListener("click", submitQuote);
    } else {
        console.error("Get Quote button not found!");
    }
});

export { supabase, fetchAllTrades, submitQuote };
