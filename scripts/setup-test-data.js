// Test data setup script for shuttle service
// This script creates sample employees and shuttles for testing

const sampleEmployees = [
  {
    id: "emp-001",
    name: "Ahmet Yılmaz",
    email: "ahmet.yilmaz@company.com",
    phone: "+90 532 123 4567",
    address: "Kadıköy, İstanbul",
    coordinates: "41.0082,28.9784",
    distance_to_office: 5.2,
    active: true
  },
  {
    id: "emp-002", 
    name: "Ayşe Demir",
    email: "ayse.demir@company.com",
    phone: "+90 533 234 5678",
    address: "Beşiktaş, İstanbul",
    coordinates: "41.0123,28.9856",
    distance_to_office: 3.8,
    active: true
  },
  {
    id: "emp-003",
    name: "Mehmet Kaya",
    email: "mehmet.kaya@company.com", 
    phone: "+90 534 345 6789",
    address: "Şişli, İstanbul",
    coordinates: "41.0067,28.9723",
    distance_to_office: 4.1,
    active: true
  },
  {
    id: "emp-004",
    name: "Fatma Özkan",
    email: "fatma.ozkan@company.com",
    phone: "+90 535 456 7890", 
    address: "Beyoğlu, İstanbul",
    coordinates: "41.0156,28.9901",
    distance_to_office: 2.9,
    active: true
  },
  {
    id: "emp-005",
    name: "Ali Çelik",
    email: "ali.celik@company.com",
    phone: "+90 536 567 8901",
    address: "Üsküdar, İstanbul", 
    coordinates: "41.0034,28.9654",
    distance_to_office: 6.3,
    active: true
  },
  {
    id: "emp-006",
    name: "Zeynep Arslan",
    email: "zeynep.arslan@company.com",
    phone: "+90 537 678 9012",
    address: "Maltepe, İstanbul",
    coordinates: "40.9856,29.1234",
    distance_to_office: 8.7,
    active: true
  },
  {
    id: "emp-007", 
    name: "Can Özdemir",
    email: "can.ozdemir@company.com",
    phone: "+90 538 789 0123",
    address: "Bakırköy, İstanbul",
    coordinates: "40.9876,28.8765",
    distance_to_office: 7.2,
    active: true
  },
  {
    id: "emp-008",
    name: "Elif Yıldız",
    email: "elif.yildiz@company.com",
    phone: "+90 539 890 1234",
    address: "Pendik, İstanbul",
    coordinates: "40.8765,29.2345",
    distance_to_office: 12.1,
    active: true
  }
];

const sampleShuttles = [
  {
    id: "shuttle-001",
    service_name: "Shuttle A - Morning Route",
    driver_name: "Hasan Şahin",
    driver_phone: "+90 540 111 2233",
    morning_shift: "07:00-09:00",
    evening_shift: "17:00-19:00", 
    capacity: 12,
    map_url: "",
    coordinates: "41.0082,28.9784;41.0123,28.9856;41.0067,28.9723;41.0156,28.9901;41.0034,28.9654",
    distance_to_office: 4.5
  },
  {
    id: "shuttle-002",
    service_name: "Shuttle B - Evening Route", 
    driver_name: "Murat Kılıç",
    driver_phone: "+90 541 222 3344",
    morning_shift: "08:00-10:00",
    evening_shift: "18:00-20:00",
    capacity: 15,
    map_url: "",
    coordinates: "40.9856,29.1234;40.9876,28.8765;40.8765,29.2345;41.0082,28.9784;41.0123,28.9856",
    distance_to_office: 6.8
  },
  {
    id: "shuttle-003",
    service_name: "Shuttle C - Express Route",
    driver_name: "Emre Doğan", 
    driver_phone: "+90 542 333 4455",
    morning_shift: "07:30-09:30",
    evening_shift: "17:30-19:30",
    capacity: 10,
    map_url: "",
    coordinates: "41.0067,28.9723;41.0156,28.9901;41.0034,28.9654;40.9856,29.1234;40.9876,28.8765",
    distance_to_office: 5.2
  }
];

// Function to save data to localStorage (for browser environment)
function saveTestData() {
  if (typeof window !== 'undefined') {
    localStorage.setItem('employees', JSON.stringify(sampleEmployees));
    localStorage.setItem('Shuttles', JSON.stringify(sampleShuttles));
    console.log('Test data saved to localStorage');
    console.log('Employees:', sampleEmployees.length);
    console.log('Shuttles:', sampleShuttles.length);
  } else {
    console.log('This script should be run in a browser environment');
  }
}

// Export for use in browser console
if (typeof window !== 'undefined') {
  window.setupTestData = saveTestData;
  console.log('Run setupTestData() in browser console to load test data');
}

// For Node.js environment
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { sampleEmployees, sampleShuttles, saveTestData };
}
