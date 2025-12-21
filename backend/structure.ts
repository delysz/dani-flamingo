// backend/structure.ts
import type { StructureResolver } from 'sanity/structure'

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('Photography')
        .icon(() => '📸')
        .child(
          S.documentList()
            .title('All Photos')
            .filter('_type == "photo"')
            .defaultOrdering([{ field: '_createdAt', direction: 'desc' }])
            .child((id) =>
              S.editor()
                .id(id)
                .schemaType('photo')
                .documentId(id)
            )
        ),
      S.divider(),
      S.listItem()
        .title('By Category')
        .icon(() => '🏷️')
        .child(
          S.list()
            .title('Categories')
            .items([
              'Beach', 'Street', 'Plants', 'People', 'Animals', 'Food', 'Abstract', 
              'Sofia', 'Sofia\'s Artwork', 'Art'
            ].map((category) =>
              S.listItem()
                .title(category)
                .child(
                  S.documentList()
                    .title(`Photos in ${category}`)
                    .filter('_type == "photo" && category == $category')
                    .params({ category })
                    .defaultOrdering([{ field: 'order', direction: 'asc' }])
                )
            )
          )
        ),
      S.divider(),
      S.listItem()
        .title('Featured Photos')
        .icon(() => '⭐')
        .child(
          S.documentList()
            .title('Featured Photos')
            .filter('_type == "photo" && isFeatured == true')
        ),
    ])