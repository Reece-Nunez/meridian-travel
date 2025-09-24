import puppeteer from 'puppeteer';
import { CustomQuote, ItineraryDay, ItineraryActivity, ItineraryImage } from '@/types/database';

interface ItineraryDayWithDetails extends ItineraryDay {
  activities: ItineraryActivity[];
  images: ItineraryImage[];
}

async function convertImageToBase64(imageUrl: string): Promise<string | null> {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) return null;

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const contentType = response.headers.get('content-type') || 'image/jpeg';

    return `data:${contentType};base64,${buffer.toString('base64')}`;
  } catch (error) {
    console.error('Error converting image to base64:', error);
    return null;
  }
}

export async function generateItineraryPDF(
  quote: CustomQuote,
  itineraryDays: ItineraryDayWithDetails[]
): Promise<Buffer> {
  // Pre-process images to base64 for better PDF compatibility
  const totalImages = itineraryDays.reduce((total, day) => total + (day.images?.length || 0), 0);
  console.log(`Converting ${totalImages} images to base64 for PDF...`);

  const processedDays = await Promise.all(
    itineraryDays.map(async (day) => ({
      ...day,
      images: await Promise.all(
        day.images.map(async (image) => {
          console.log(`Converting image: ${image.image_url}`);
          const base64Image = await convertImageToBase64(image.image_url);
          console.log(`Image conversion ${base64Image ? 'successful' : 'failed'} for: ${image.image_url}`);
          return {
            ...image,
            base64_url: base64Image,
            original_url: image.image_url
          };
        })
      )
    }))
  );

  const successfulConversions = processedDays.reduce(
    (total, day) => total + day.images.filter((img: any) => img.base64_url).length,
    0
  );
  console.log(`Successfully converted ${successfulConversions}/${totalImages} images to base64`);

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security', '--disable-features=VizDisplayCompositor']
  });

  try {
    const page = await browser.newPage();

    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };

    const getActivityIcon = (type: string) => {
      switch (type) {
        case 'flight': return '✈️';
        case 'tour': return '🗺️';
        case 'excursion': return '🏞️';
        case 'activity': return '🎯';
        default: return '📅';
      }
    };

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${quote.pdf_title || `${quote.destination} Itinerary`}</title>
          <style>
            body {
              font-family: 'Segoe UI', Arial, sans-serif;
              margin: 0;
              padding: 20px;
              color: #333;
              background: #fff;
            }
            .header {
              background: linear-gradient(135deg, #8B4513, #DAA520);
              color: white;
              padding: 30px;
              border-radius: 10px;
              margin-bottom: 30px;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 32px;
              font-weight: bold;
            }
            .header p {
              margin: 10px 0;
              font-size: 18px;
              opacity: 0.9;
            }
            .trip-details {
              background: #f8f5f0;
              padding: 20px;
              border-radius: 8px;
              margin-bottom: 30px;
              border-left: 4px solid #DAA520;
            }
            .trip-details h3 {
              margin: 0 0 15px 0;
              color: #8B4513;
              font-size: 20px;
            }
            .detail-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 15px;
            }
            .detail-item {
              display: flex;
              justify-content: space-between;
            }
            .detail-label {
              font-weight: 500;
              color: #666;
            }
            .detail-value {
              font-weight: 600;
              color: #8B4513;
            }
            .day {
              background: white;
              border: 1px solid #e0e0e0;
              border-radius: 10px;
              margin-bottom: 30px;
              overflow: hidden;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .day-header {
              background: linear-gradient(135deg, #B8860B, #DAA520);
              color: white;
              padding: 20px;
            }
            .day-title h3 {
              margin: 0;
              font-size: 22px;
            }
            .day-title p {
              margin: 5px 0 0 0;
              opacity: 0.9;
            }
            .day-content {
              padding: 25px;
            }
            .day-description {
              margin-bottom: 25px;
              line-height: 1.6;
              font-size: 16px;
              color: #555;
            }
            .activities {
              margin-top: 20px;
            }
            .activities h4 {
              color: #8B4513;
              margin-bottom: 15px;
              font-size: 18px;
            }
            .activity {
              background: #f9f9f9;
              padding: 15px;
              border-radius: 8px;
              margin-bottom: 10px;
              border-left: 3px solid #B8860B;
            }
            .activity-header {
              display: flex;
              align-items: center;
              margin-bottom: 8px;
            }
            .activity-icon {
              font-size: 18px;
              margin-right: 10px;
            }
            .activity-name {
              font-weight: 600;
              color: #333;
              font-size: 16px;
            }
            .activity-description {
              color: #666;
              line-height: 1.4;
              margin-left: 28px;
            }
            .activity-type {
              background: #B8860B;
              color: white;
              padding: 2px 8px;
              border-radius: 4px;
              font-size: 12px;
              margin-left: auto;
            }
            .footer {
              text-align: center;
              margin-top: 40px;
              padding: 20px;
              border-top: 2px solid #DAA520;
              color: #666;
            }
            .footer h3 {
              color: #8B4513;
              margin-bottom: 10px;
            }
            .images-section {
              margin-top: 20px;
            }
            .images-section h4 {
              color: #8B4513;
              margin-bottom: 15px;
              font-size: 18px;
            }
            .image-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
              gap: 15px;
              margin-top: 10px;
            }
            .image-container {
              position: relative;
              background: #f9f9f9;
              border-radius: 8px;
              overflow: hidden;
              border: 1px solid #e0e0e0;
            }
            .image-container img {
              width: 100%;
              height: 150px;
              object-fit: cover;
              display: block;
            }
            .image-placeholder {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              height: 150px;
              background: #f0f0f0;
              color: #666;
              text-align: center;
            }
            .image-placeholder span {
              font-size: 24px;
              margin-bottom: 8px;
            }
            .image-placeholder p {
              margin: 0;
              font-size: 12px;
            }
            @media print {
              body { margin: 0; }
              .day { break-inside: avoid; }
              .image-container { break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <!-- Header -->
          <div class="header">
            <h1>${quote.pdf_title || `Your ${quote.destination} Adventure`}</h1>
            <p>${quote.duration} Days of Luxury Travel</p>
            ${quote.travel_dates_start && quote.travel_dates_end ? `
              <p>📅 ${formatDate(quote.travel_dates_start)} - ${formatDate(quote.travel_dates_end)}</p>
            ` : ''}
            <p>👥 ${quote.participants} Travelers</p>
          </div>

          <!-- Trip Details -->
          <div class="trip-details">
            <h3>Trip Overview</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="detail-label">Destination:</span>
                <span class="detail-value">${quote.destination}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Duration:</span>
                <span class="detail-value">${quote.duration} days</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Travelers:</span>
                <span class="detail-value">${quote.participants} people</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Contact:</span>
                <span class="detail-value">${quote.contact_email}</span>
              </div>
            </div>
          </div>

          <!-- Itinerary Days -->
          ${processedDays.length > 0 ? processedDays.map((day, index) => `
            <div class="day">
              <div class="day-header">
                <div class="day-title">
                  <h3>${day.day_label}</h3>
                  <p>${formatDate(day.start_date)} • ${day.city}</p>
                </div>
              </div>
              <div class="day-content">
                <div class="day-description">${day.description}</div>

                ${day.activities.length > 0 ? `
                  <div class="activities">
                    <h4>Today's Activities</h4>
                    ${day.activities.map(activity => `
                      <div class="activity">
                        <div class="activity-header">
                          <span class="activity-icon">${getActivityIcon(activity.activity_type)}</span>
                          <span class="activity-name">${activity.name}</span>
                          ${activity.custom_type ? `<span class="activity-type">${activity.custom_type}</span>` : ''}
                        </div>
                        <div class="activity-description">${activity.description}</div>
                      </div>
                    `).join('')}
                  </div>
                ` : ''}

                ${day.images && day.images.length > 0 ? `
                  <div class="images-section">
                    <h4>Gallery</h4>
                    <div class="image-grid">
                      ${day.images.map((image: any) => {
                        if (image.base64_url) {
                          return `
                            <div class="image-container">
                              <img src="${image.base64_url}"
                                   alt="${image.alt_text || 'Itinerary image'}" />
                            </div>
                          `;
                        } else {
                          return `
                            <div class="image-container">
                              <div class="image-placeholder" style="display: flex;">
                                <span>📷</span>
                                <p>${image.alt_text || 'Image'}</p>
                              </div>
                            </div>
                          `;
                        }
                      }).join('')}
                    </div>
                  </div>
                ` : ''}
              </div>
            </div>
          `).join('') : `
            <div class="day">
              <div class="day-content" style="text-align: center; padding: 40px;">
                <h3 style="color: #8B4513; margin-bottom: 15px;">Itinerary Coming Soon</h3>
                <p style="color: #666;">Your detailed day-by-day itinerary is being prepared and will be available shortly.</p>
              </div>
            </div>
          `}

          <!-- Footer -->
          <div class="footer">
            <h3>Meridian Luxury Travel</h3>
            <p>Creating Unforgettable South American Adventures</p>
            <p>📧 chris@meridianluxury.travel</p>
            <p style="font-size: 12px; margin-top: 15px;">
              Generated on ${new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        </body>
      </html>
    `;

    // Set page content with increased timeout for images
    await page.setContent(html, {
      waitUntil: 'networkidle0',
      timeout: 60000
    });

    // Wait for images to fully load
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Check if images are loaded by evaluating in the browser context
    await page.evaluate(() => {
      return Promise.all(
        Array.from(document.images).map(img => {
          if (img.complete) return Promise.resolve();
          return new Promise((resolve) => {
            img.addEventListener('load', resolve);
            img.addEventListener('error', resolve);
          });
        })
      );
    });

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: false,
      margin: {
        top: '20mm',
        bottom: '20mm',
        left: '20mm',
        right: '20mm'
      }
    });

    return Buffer.from(pdf);

  } finally {
    await browser.close();
  }
}