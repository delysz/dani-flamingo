import { defineField, defineType } from 'sanity'

export const photoType = defineType({
  name: 'photo',
  title: 'Photo',
  type: 'document',
  icon: () => '📸',
  fields: [
    defineField({ 
      name: 'title', 
      title: 'Title', 
      type: 'string',
      validation: (Rule) => Rule.required().min(2).max(80) 
    }),
    
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      description: 'Select the category for this photo',
      options: {
        list: [
          { title: '🏖️ Beach', value: 'Beach' },
          { title: '🏙️ Street', value: 'Street' },
          { title: '🌿 Plants', value: 'Plants' },
          { title: '👥 People', value: 'People' },
          { title: '🐾 Animals', value: 'Animals' },
          { title: '🍕 Food', value: 'Food' },
          { title: '🎨 Abstract', value: 'Abstract' },
          { title: '👸 Sofia', value: 'Sofia' },
          { title: '🖼️ Sofia\'s Artwork', value: 'Sofia\'s Artwork' },
        ],
        layout: 'dropdown'
      },
      validation: (Rule) => Rule.required(),
    }),

    defineField({ 
      name: 'country', 
      title: 'Country/Location', 
      type: 'string', 
      description: 'Country where the photo was taken (e.g., Japan, Peru, Spain)',
    }),
    
    defineField({
      name: 'year',
      title: 'Year',
      type: 'number',
      description: 'Year when the photo was taken',
      validation: (Rule) => Rule.min(2000).max(2025)
    }),
    
    defineField({
      name: 'location',
      title: 'GPS Location',
      type: 'geopoint',
      description: 'Optional: Mark the location on the map',
    }),

    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: { 
        hotspot: true,
      },
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      description: 'Optional description or story behind the photo',
      rows: 3,
    }),

    defineField({
      name: 'isFeatured',
      title: 'Featured',
      type: 'boolean',
      description: 'Mark as featured photo',
      initialValue: false,
    }),

    defineField({
      name: 'order',
      title: 'Order',
      type: 'number',
      description: 'Display order (lower numbers first)',
      initialValue: 0,
    }),
  ],
  
  preview: {
    select: {
      title: 'title',
      category: 'category',
      media: 'image',
      country: 'country'
    },
    prepare(selection) {
      const { title, category, media, country } = selection
      return {
        title: title || 'Untitled',
        subtitle: `${category}${country ? ` • ${country}` : ''}`,
        media: media
      }
    }
  },
})