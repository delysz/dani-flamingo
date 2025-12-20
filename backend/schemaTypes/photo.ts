// backend/schemaTypes/photo.ts
import { defineField, defineType } from 'sanity'

export const photoType = defineType({
  name: 'photo',
  title: 'Photos',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string', validation: Rule => Rule.required() }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Street', value: 'street' },
          { title: 'Beach', value: 'beach' },
          { title: 'People', value: 'people' },
          { title: 'Animals', value: 'animals' },
          { title: 'Plants', value: 'plants' },
          { title: 'Abstract', value: 'abstract' },
          { title: 'Food', value: 'food' },
          { title: 'Travel Photography', value: 'travel' },
          { title: 'Art', value: 'art' },
          { title: 'Sofia', value: 'sofia' },
          { title: 'Sofia\'s Artwork', value: 'sofia-art' },
          { title: 'Baby Flamingo', value: 'baby-flamingo' },
        ],
      },
      validation: Rule => Rule.required(),
    }),
    defineField({ name: 'image', title: 'Photo File', type: 'image', options: { hotspot: true }, validation: Rule => Rule.required() }),
  ],
})